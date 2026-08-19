"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
}

const nameSchema = z.string().trim().min(1, "El nombre es obligatorio");

export type CategoryFormState = { error?: string };

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nombre inválido" };
  }

  const base = slugify(parsed.data) || "categoria";
  let slug = base;
  let counter = 1;
  while (await db.query.categories.findFirst({ where: eq(categories.slug, slug) })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  await db.insert(categories).values({ name: parsed.data, slug });
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return {};
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}
