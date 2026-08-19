import Link from "next/link";
import { db } from "@/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  const allProducts = await db.query.products.findMany();

  const totalProducts = allProducts.length;
  const activeProducts = allProducts.filter((p) => p.isActive).length;
  const lowStock = allProducts.filter((p) => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0);
  const outOfStock = allProducts.filter((p) => p.stock === 0);
  const inventoryValue = allProducts.reduce(
    (sum, p) => sum + parseFloat(p.price) * p.stock,
    0
  );

  const stats = [
    { label: "Productos totales", value: totalProducts },
    { label: "Publicados en la tienda", value: activeProducts },
    { label: "Stock bajo", value: lowStock.length },
    { label: "Sin stock", value: outOfStock.length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Panel</h1>
        <p className="text-sm text-neutral-500">Resumen general de tu inventario</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm text-neutral-500">Valor total del inventario (precio × stock)</p>
        <p className="text-xl font-semibold text-neutral-900">{formatPrice(inventoryValue)}</p>
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-2 text-sm font-medium text-amber-900">Atención de stock</h2>
          <ul className="space-y-1 text-sm text-amber-800">
            {outOfStock.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/productos/${p.id}`} className="underline">
                  {p.name}
                </Link>{" "}
                — sin stock
              </li>
            ))}
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/productos/${p.id}`} className="underline">
                  {p.name}
                </Link>{" "}
                — quedan {p.stock} unidades
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Cargar producto
        </Link>
      </div>
    </div>
  );
}
