"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productMedia } from "@/db/schema";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

const mediaSchema = z.array(
  z.object({
    type: z.enum(["image", "video"]),
    url: z.string().url(),
  })
);

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().optional().default(""),
  costProduct: z.coerce.number().min(0, "El costo no puede ser negativo").default(0),
  costShipping: z.coerce.number().min(0, "El flete no puede ser negativo").default(0),
  costAdditional: z.coerce.number().min(0, "El costo adicional no puede ser negativo").default(0),
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
    description: formData.get("description"),
    costProduct: formData.get("costProduct"),
    costShipping: formData.get("costShipping"),
    costAdditional: formData.get("costAdditional"),
    priceList: formData.get("priceList"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const media = parseMedia(formData.get("media"));
  const slug = await generateUniqueSlug(parsed.data.name);

  const [created] = await db
    .insert(products)
    .values({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? "",
      costProduct: parsed.data.costProduct.toString(),
      costShipping: parsed.data.costShipping.toString(),
      costAdditional: parsed.data.costAdditional.toString(),
      priceList: parsed.data.priceList.toString(),
      stock: parsed.data.stock,
      categoryId: parsed.data.categoryId || null,
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
    description: formData.get("description"),
    costProduct: formData.get("costProduct"),
    costShipping: formData.get("costShipping"),
    costAdditional: formData.get("costAdditional"),
    priceList: formData.get("priceList"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const media = parseMedia(formData.get("media"));
  const slug = await generateUniqueSlug(parsed.data.name, id);

  await db
    .update(products)
    .set({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? "",
      costProduct: parsed.data.costProduct.toString(),
      costShipping: parsed.data.costShipping.toString(),
      costAdditional: parsed.data.costAdditional.toString(),
      priceList: parsed.data.priceList.toString(),
      stock: parsed.data.stock,
      categoryId: parsed.data.categoryId || null,
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
