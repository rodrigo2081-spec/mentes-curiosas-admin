"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { sales, saleItems, products } from "@/db/schema";
import { auth } from "@/auth";
import {
  PAYMENT_METHODS,
  cashBoxForPaymentMethod,
  priceForPaymentMethod,
  totalCost,
  type PaymentMethod,
} from "@/lib/pricing";
import { getDollarRate } from "@/lib/settings";
import { sendSaleNotifications } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
}

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

const paymentMethodValues = PAYMENT_METHODS.map((m) => m.value) as [
  PaymentMethod,
  ...PaymentMethod[],
];

const saleSchema = z.object({
  customerName: z.string().trim().min(1, "El nombre del cliente es obligatorio"),
  customerPhone: z.string().trim().min(1, "El teléfono es obligatorio"),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  customerAddress: z.string().trim().optional().default(""),
  paymentMethod: z.enum(paymentMethodValues),
  note: z.string().trim().optional().default(""),
});

export type SaleFormState = { error?: string };

export async function createSale(
  _prevState: SaleFormState,
  formData: FormData
): Promise<SaleFormState> {
  await requireAdmin();

  const parsed = saleSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    customerAddress: formData.get("customerAddress"),
    paymentMethod: formData.get("paymentMethod"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  let cartRaw: unknown;
  try {
    cartRaw = JSON.parse((formData.get("cart") as string) || "[]");
  } catch {
    return { error: "Carrito inválido" };
  }
  const cartParsed = z.array(cartItemSchema).safeParse(cartRaw);
  if (!cartParsed.success || cartParsed.data.length === 0) {
    return { error: "Agregá al menos un producto a la venta" };
  }

  const productIds = cartParsed.data.map((i) => i.productId);
  const dbProducts = await db.query.products.findMany({
    where: (products, { inArray }) => inArray(products.id, productIds),
  });
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  for (const item of cartParsed.data) {
    const product = productMap.get(item.productId);
    if (!product) return { error: "Uno de los productos ya no existe" };
    if (product.stock < item.quantity) {
      return { error: `Stock insuficiente para "${product.name}" (quedan ${product.stock})` };
    }
  }

  const cashBox = cashBoxForPaymentMethod(parsed.data.paymentMethod);
  const dollarRate = await getDollarRate();

  const items = cartParsed.data.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = priceForPaymentMethod(product.priceList, parsed.data.paymentMethod);
    const unitCost = totalCost(product, dollarRate);
    return {
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: unitPrice.toString(),
      unitCost: unitCost.toString(),
      subtotal: unitPrice * item.quantity,
    };
  });

  const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);

  const saleId = await db.transaction(async (tx) => {
    const [sale] = await tx
      .insert(sales)
      .values({
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail || null,
        customerAddress: parsed.data.customerAddress || null,
        paymentMethod: parsed.data.paymentMethod,
        cashBox,
        totalAmount: totalAmount.toString(),
        note: parsed.data.note || null,
      })
      .returning({ id: sales.id });

    await tx.insert(saleItems).values(
      items.map((it) => ({
        saleId: sale.id,
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        unitCost: it.unitCost,
      }))
    );

    for (const item of cartParsed.data) {
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }

    return sale.id;
  });

  // El envío de emails nunca debe bloquear ni hacer fallar la venta ya
  // confirmada: sendSaleNotifications atrapa sus propios errores.
  await sendSaleNotifications({
    id: saleId,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    customerEmail: parsed.data.customerEmail || null,
    customerAddress: parsed.data.customerAddress || null,
    paymentMethod: parsed.data.paymentMethod,
    totalAmount,
    note: parsed.data.note || null,
    items: items.map((it) => ({
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  });

  revalidatePath("/admin/ventas");
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  redirect("/admin/ventas");
}

export async function deleteSale(id: string) {
  await requireAdmin();
  // No se repone el stock automáticamente al borrar: se asume que fue un error de carga.
  await db.delete(sales).where(eq(sales.id, id));
  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
}
