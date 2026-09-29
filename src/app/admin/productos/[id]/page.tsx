import { notFound } from "next/navigation";
import { db } from "@/db";
import { getDollarRate } from "@/lib/settings";
import { ProductForm } from "../product-form";
import { updateProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage(
  props: PageProps<"/admin/productos/[id]">
) {
  const { id } = await props.params;

  const [product, categories, dollarRate] = await Promise.all([
    db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, id),
      with: { media: { orderBy: (media, { asc }) => [asc(media.position)] } },
    }),
    db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    }),
    getDollarRate(),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Editar producto</h1>
        <p className="text-sm text-neutral-500">{product.name}</p>
      </div>
      <ProductForm
        action={updateWithId}
        categories={categories}
        submitLabel="Guardar cambios"
        dollarRate={dollarRate}
        initialValues={{
          name: product.name,
          code: product.code,
          description: product.description,
          costProduct: product.costProduct,
          costShipping: product.costShipping,
          costAdditional: product.costAdditional,
          costCurrency: product.costCurrency,
          commissionPercent: product.commissionPercent,
          priceList: product.priceList,
          stock: product.stock,
          categoryId: product.categoryId,
          isActive: product.isActive,
          media: product.media.map((m) => ({ type: m.type, url: m.url })),
          ageRange: product.ageRange,
          learningSkills: product.learningSkills,
        }}
      />
    </div>
  );
}
