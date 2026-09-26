"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productMedia, categories } from "@/db/schema";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";
import { getDollarRate } from "@/lib/settings";
import { totalCost } from "@/lib/pricing";

const mediaSchema = z.array(
  z.object({
    type: z.enum(["image", "video"]),
    url: z.string().url(),
  })
);

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  code: z.string().trim().min(1, "El código es obligatorio"),
  description: z.string().trim().optional().default(""),
  costProduct: z.coerce.number().min(0, "El costo no puede ser negativo").default(0),
  costShipping: z.coerce.number().min(0, "El flete no puede ser negativo").default(0),
  costAdditional: z.coerce.number().min(0, "El costo adicional no puede ser negativo").default(0),
  costCurrency: z.enum(["ars", "usd"]).default("ars"),
  commissionPercent: z.coerce
    .number()
    .min(0, "La comisión no puede ser negativa")
    .max(100, "La comisión no puede superar el 100%")
    .default(0),
  priceList: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional().default(true),
});

export type ProductFormState = {
  error?: string;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
}

function parseMedia(raw: FormDataEntryValue | null) {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return mediaSchema.parse(parsed);
  } catch {
    return [];
  }
}

// La moneda (pesos/dólares) es solo un dato de entrada para el costo de la
// mercadería: si se cargó en dólares, se convierte a pesos ACÁ, una sola vez,
// con la cotización vigente en este momento, y se guarda ya convertido. Así
// si la cotización cambia después, este producto no se ve afectado (no nos
// interesa el valor histórico en dólares, solo el costo en pesos ya fijado).
// Flete y costo adicional siempre son en pesos, nunca se convierten.
function resolveMerchCost(costProduct: number, costCurrency: "ars" | "usd", dollarRate: number) {
  if (costCurrency === "usd") {
    return { costProduct: Math.round(costProduct * dollarRate * 100) / 100, costCurrency: "ars" as const };
  }
  return { costProduct, costCurrency: "ars" as const };
}

// El Precio de Lista se calcula automático como el doble del costo total
// (100% de margen), salvo en categorías marcadas como "precio manual" (ej.
// Libro), donde se respeta el valor que cargó el admin.
async function resolvePriceList(
  categoryId: string | null,
  manualPriceList: number,
  costFields: { costProduct: number; costShipping: number; costAdditional: number; commissionPercent: number },
  dollarRate: number
) {
  const category = categoryId
    ? await db.query.categories.findFirst({ where: eq(categories.id, categoryId) })
    : null;

  if (category?.manualPriceList) {
    return manualPriceList;
  }

  const cost = totalCost({ ...costFields, costCurrency: "ars" }, dollarRate);
  return Math.round(cost * 2 * 100) / 100;
}

async function codeInUse(code: string, ignoreId?: string) {
  const existing = await db.query.products.findFirst({ where: eq(products.code, code) });
  return !!existing && existing.id !== ignoreId;
}

async function generateUniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "producto";
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await db.query.products.findFirst({ where: eq(products.slug, slug) });
    if (!existing || existing.id === ignoreId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
    costProduct: formData.get("costProduct"),
    costShipping: formData.get("costShipping"),
    costAdditional: formData.get("costAdditional"),
    costCurrency: formData.get("costCurrency"),
    commissionPercent: formData.get("commissionPercent"),
    priceList: formData.get("priceList"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (await codeInUse(parsed.data.code)) {
    return { error: `Ya existe un producto con el código "${parsed.data.code}"` };
  }

  const media = parseMedia(formData.get("media"));
  const slug = await generateUniqueSlug(parsed.data.name);
  const dollarRate = await getDollarRate();
  const merch = resolveMerchCost(parsed.data.costProduct, parsed.data.costCurrency, dollarRate);
  const categoryId = parsed.data.categoryId || null;
  const priceList = await resolvePriceList(
    categoryId,
    parsed.data.priceList,
    {
      costProduct: merch.costProduct,
      costShipping: parsed.data.costShipping,
      costAdditional: parsed.data.costAdditional,
      commissionPercent: parsed.data.commissionPercent,
    },
    dollarRate
  );

  const [created] = await db
    .insert(products)
    .values({
      name: parsed.data.name,
      code: parsed.data.code,
      slug,
      description: parsed.data.description ?? "",
      costProduct: merch.costProduct.toString(),
      costShipping: parsed.data.costShipping.toString(),
      costAdditional: parsed.data.costAdditional.toString(),
      costCurrency: merch.costCurrency,
      commissionPercent: parsed.data.commissionPercent.toString(),
      priceList: priceList.toString(),
      stock: parsed.data.stock,
      categoryId,
      isActive: parsed.data.isActive ?? true,
    })
    .returning({ id: products.id });

  if (media.length > 0) {
    await db.insert(productMedia).values(
      media.map((m, i) => ({
        productId: created.id,
        type: m.type,
        url: m.url,
        position: i,
      }))
    );
  }

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
    costProduct: formData.get("costProduct"),
    costShipping: formData.get("costShipping"),
    costAdditional: formData.get("costAdditional"),
    costCurrency: formData.get("costCurrency"),
    commissionPercent: formData.get("commissionPercent"),
    priceList: formData.get("priceList"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (await codeInUse(parsed.data.code, id)) {
    return { error: `Ya existe un producto con el código "${parsed.data.code}"` };
  }

  const media = parseMedia(formData.get("media"));
  const slug = await generateUniqueSlug(parsed.data.name, id);
  const dollarRate = await getDollarRate();
  const merch = resolveMerchCost(parsed.data.costProduct, parsed.data.costCurrency, dollarRate);
  const categoryId = parsed.data.categoryId || null;
  const priceList = await resolvePriceList(
    categoryId,
    parsed.data.priceList,
    {
      costProduct: merch.costProduct,
      costShipping: parsed.data.costShipping,
      costAdditional: parsed.data.costAdditional,
      commissionPercent: parsed.data.commissionPercent,
    },
    dollarRate
  );

  await db
    .update(products)
    .set({
      name: parsed.data.name,
      code: parsed.data.code,
      slug,
      description: parsed.data.description ?? "",
      costProduct: merch.costProduct.toString(),
      costShipping: parsed.data.costShipping.toString(),
      costAdditional: parsed.data.costAdditional.toString(),
      costCurrency: merch.costCurrency,
      commissionPercent: parsed.data.commissionPercent.toString(),
      priceList: priceList.toString(),
      stock: parsed.data.stock,
      categoryId,
      isActive: parsed.data.isActive ?? true,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  await db.delete(productMedia).where(eq(productMedia.productId, id));
  if (media.length > 0) {
    await db.insert(productMedia).values(
      media.map((m, i) => ({
        productId: id,
        type: m.type,
        url: m.url,
        position: i,
      }))
    );
  }

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/productos");
}

export async function updateStock(id: string, stock: number) {
  await requireAdmin();
  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("Stock inválido");
  }
  await db
    .update(products)
    .set({ stock: Math.trunc(stock), updatedAt: new Date() })
    .where(eq(products.id, id));
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
}

export async function toggleActive(id: string, isActive: boolean) {
  await requireAdmin();
  await db
    .update(products)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(products.id, id));
  revalidatePath("/admin/productos");
}
