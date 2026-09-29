import { db } from "@/db";

// Consultas de solo lectura para la tienda online. Solo se muestran
// productos activos (isActive) — el stock en 0 se muestra igual pero sin
// poder agregarlo al carrito.

export async function getStoreCategories() {
  const cats = await db.query.categories.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
    with: {
      products: {
        where: (p, { eq, and, gt }) => and(eq(p.isActive, true), gt(p.stock, 0)),
        columns: { id: true },
      },
    },
  });
  return cats
    .filter((c) => c.products.length > 0)
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
}

export async function getFeaturedProducts(limit = 8) {
  return db.query.products.findMany({
    where: (p, { eq }) => eq(p.isActive, true),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    with: {
      media: { orderBy: (m, { asc }) => [asc(m.position)], limit: 1 },
      category: true,
    },
    limit,
  });
}

export async function getStoreProducts(categorySlug?: string) {
  let categoryId: string | undefined;
  if (categorySlug) {
    const category = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.slug, categorySlug),
    });
    if (!category) return [];
    categoryId = category.id;
  }

  return db.query.products.findMany({
    where: (p, { eq, and }) =>
      categoryId ? and(eq(p.isActive, true), eq(p.categoryId, categoryId)) : eq(p.isActive, true),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
    with: {
      media: { orderBy: (m, { asc }) => [asc(m.position)], limit: 1 },
      category: true,
    },
  });
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: (p, { eq, and }) => and(eq(p.slug, slug), eq(p.isActive, true)),
    with: {
      media: { orderBy: (m, { asc }) => [asc(m.position)] },
      category: true,
    },
  });
}
