import { db } from "@/db";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const categories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Cargar producto</h1>
        <p className="text-sm text-neutral-500">
          Se va a mostrar en la tienda online automáticamente si queda marcado como visible.
        </p>
      </div>
      <ProductForm action={createProduct} categories={categories} submitLabel="Cargar producto" />
    </div>
  );
}
