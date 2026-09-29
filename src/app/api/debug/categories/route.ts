import { NextResponse } from "next/server";
import { db } from "@/db";

// Endpoint temporal de solo lectura para diagnosticar por qué el nav de la
// tienda no muestra categorías. Sin datos sensibles (solo nombres/slugs y
// conteos). Se borra apenas se usa.
export async function GET() {
  const cats = await db.query.categories.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
    with: {
      products: { columns: { id: true, isActive: true, stock: true } },
    },
  });

  const productsWithoutCategory = await db.query.products.findMany({
    where: (p, { isNull }) => isNull(p.categoryId),
    columns: { id: true, name: true, isActive: true, stock: true },
  });

  return NextResponse.json({
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      totalProducts: c.products.length,
      activeInStock: c.products.filter((p) => p.isActive && p.stock > 0).length,
    })),
    productsWithoutCategoryCount: productsWithoutCategory.length,
    productsWithoutCategorySample: productsWithoutCategory.slice(0, 5).map((p) => p.name),
  });
}
