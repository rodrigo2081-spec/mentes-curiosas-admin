import Link from "next/link";
import { db } from "@/db";
import { formatPrice } from "@/lib/utils";
import { priceCash, totalCost } from "@/lib/pricing";
import { getDollarRate } from "@/lib/settings";
import { deleteProduct } from "./actions";
import { StockQuickEdit } from "./stock-quick-edit";
import { ActiveToggle } from "./active-toggle";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const [allProducts, dollarRate] = await Promise.all([
    db.query.products.findMany({
      with: { category: true, media: { limit: 1 } },
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    }),
    getDollarRate(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Productos</h1>
          <p className="text-sm text-neutral-500">
            {allProducts.length} productos cargados · Cotización dólar: {formatPrice(dollarRate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/administracion"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Editar cotización
          </Link>
          <Link
            href="/admin/productos/nuevo"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            + Cargar producto
          </Link>
        </div>
      </div>

      {allProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          Todavía no cargaste ningún producto.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Costo</th>
                <th className="px-4 py-3 font-medium">Lista / Contado</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Tienda</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {allProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
                        {product.media[0] && product.media[0].type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.media[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatPrice(totalCost(product, dollarRate))}
                    {product.costCurrency === "usd" && (
                      <span className="ml-1 rounded bg-neutral-100 px-1 py-0.5 text-[10px] font-medium text-neutral-500">
                        USD
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatPrice(product.priceList)}
                    <span className="block text-xs text-neutral-400">
                      {formatPrice(priceCash(product.priceList))} contado
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StockQuickEdit id={product.id} stock={product.stock} />
                  </td>
                  <td className="px-4 py-3">
                    <ActiveToggle id={product.id} isActive={product.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="text-neutral-600 hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={product.id} action={deleteProduct} name={product.name} />
                    </div>
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
