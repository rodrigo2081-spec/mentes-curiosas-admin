import Link from "next/link";
import { db } from "@/db";
import { formatPrice } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/pricing";
import { CASH_BOX_LABELS } from "@/lib/pricing";
import { deleteSale } from "./actions";
import { DeleteButton } from "../productos/delete-button";

export const dynamic = "force-dynamic";

export default async function VentasPage() {
  const allSales = await db.query.sales.findMany({
    with: { items: true },
    orderBy: (sales, { desc }) => [desc(sales.date)],
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Ventas</h1>
          <p className="text-sm text-neutral-500">Últimas {allSales.length} ventas cargadas</p>
        </div>
        <Link
          href="/admin/ventas/nueva"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Cargar venta
        </Link>
      </div>

      {allSales.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          Todavía no cargaste ninguna venta.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 font-medium">Caja</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {allSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                    {new Date(sale.date).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{sale.customerName}</p>
                    <p className="text-xs text-neutral-500">{sale.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {sale.items.map((it) => `${it.quantity}× ${it.productName}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {paymentMethodLabel(sale.paymentMethod)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{CASH_BOX_LABELS[sale.cashBox]}</td>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {formatPrice(sale.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      id={sale.id}
                      name={`la venta a ${sale.customerName}`}
                      action={deleteSale}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
