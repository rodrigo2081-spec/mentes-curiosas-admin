import { db } from "@/db";
import { SaleForm } from "../sale-form";

export const dynamic = "force-dynamic";

export default async function NuevaVentaPage() {
  const products = await db.query.products.findMany({
    orderBy: (products, { asc }) => [asc(products.name)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Cargar venta</h1>
        <p className="text-sm text-neutral-500">
          El stock se descuenta automáticamente al confirmar.
        </p>
      </div>
      <SaleForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          priceList: p.priceList,
          stock: p.stock,
        }))}
      />
    </div>
  );
}
