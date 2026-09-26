import Link from "next/link";
import { and, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { sales, expenses } from "@/db/schema";
import { formatPrice } from "@/lib/utils";
import { priceCash, toNumber, totalCost } from "@/lib/pricing";
import { getDollarRate } from "@/lib/settings";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  const [allProducts, salesThisMonth, expensesThisMonth, dollarRate] = await Promise.all([
    db.query.products.findMany(),
    db.query.sales.findMany({
      where: and(gte(sales.date, monthStart), lt(sales.date, monthEnd)),
      with: { items: true },
    }),
    db.query.expenses.findMany({
      where: and(gte(expenses.date, monthStart), lt(expenses.date, monthEnd)),
    }),
    getDollarRate(),
  ]);

  const totalProducts = allProducts.length;
  const lowStock = allProducts.filter((p) => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0);
  const outOfStock = allProducts.filter((p) => p.stock === 0);

  const inventoryCost = allProducts.reduce((sum, p) => sum + totalCost(p, dollarRate) * p.stock, 0);
  const inventoryList = allProducts.reduce((sum, p) => sum + toNumber(p.priceList) * p.stock, 0);
  const inventoryCash = allProducts.reduce(
    (sum, p) => sum + priceCash(p.priceList) * p.stock,
    0
  );

  const ventasDelMes = salesThisMonth.reduce((sum, s) => sum + toNumber(s.totalAmount), 0);
  const costoMercaderiaVendida = salesThisMonth.reduce(
    (sum, s) => sum + s.items.reduce((isum, it) => isum + toNumber(it.unitCost) * it.quantity, 0),
    0
  );
  const gastosDelMes = expensesThisMonth.reduce((sum, e) => sum + toNumber(e.amount), 0);
  const costosDelMes = costoMercaderiaVendida + gastosDelMes;
  const gananciaEstimada = ventasDelMes - costosDelMes;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Panel</h1>
        <p className="text-sm text-neutral-500 capitalize">
          {monthLabel} · Cotización dólar: {formatPrice(dollarRate)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-2xl font-semibold text-neutral-900">{totalProducts}</p>
          <p className="text-sm text-neutral-500">Productos totales</p>
          <div className="mt-3 space-y-0.5 border-t border-neutral-100 pt-2 text-xs text-neutral-500">
            <p>
              Costo: <span className="font-medium text-neutral-700">{formatPrice(inventoryCost)}</span>
            </p>
            <p>
              Precio Lista:{" "}
              <span className="font-medium text-neutral-700">{formatPrice(inventoryList)}</span>
            </p>
            <p>
              Precio Contado:{" "}
              <span className="font-medium text-neutral-700">{formatPrice(inventoryCash)}</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-2xl font-semibold text-neutral-900">{formatPrice(ventasDelMes)}</p>
          <p className="text-sm text-neutral-500">Ventas del mes</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-2xl font-semibold text-neutral-900">{formatPrice(costosDelMes)}</p>
          <p className="text-sm text-neutral-500">Costos del mes</p>
          <div className="mt-3 space-y-0.5 border-t border-neutral-100 pt-2 text-xs text-neutral-500">
            <p>
              Mercadería vendida:{" "}
              <span className="font-medium text-neutral-700">
                {formatPrice(costoMercaderiaVendida)}
              </span>
            </p>
            <p>
              Gastos operativos:{" "}
              <span className="font-medium text-neutral-700">{formatPrice(gastosDelMes)}</span>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p
            className={`text-2xl font-semibold ${gananciaEstimada >= 0 ? "text-green-700" : "text-red-600"}`}
          >
            {formatPrice(gananciaEstimada)}
          </p>
          <p className="text-sm text-neutral-500">Ganancia estimada</p>
        </div>
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

      <div className="flex gap-3">
        <Link
          href="/admin/productos/nuevo"
          className="inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Cargar producto
        </Link>
        <Link
          href="/admin/ventas/nueva"
          className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          + Cargar venta
        </Link>
      </div>
    </div>
  );
}
