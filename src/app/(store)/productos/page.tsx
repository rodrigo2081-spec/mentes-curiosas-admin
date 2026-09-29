import Link from "next/link";
import { getStoreCategories, getStoreProducts } from "@/lib/store-data";
import { ProductCard } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [categories, productsList] = await Promise.all([
    getStoreCategories(),
    getStoreProducts(categoria),
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl text-ink">{activeCategory ? activeCategory.name : "Catálogo"}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/productos"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !categoria ? "bg-coral text-white" : "bg-white text-ink/70 hover:bg-cream"
          }`}
        >
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/productos?categoria=${c.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              c.slug === categoria ? "bg-coral text-white" : "bg-white text-ink/70 hover:bg-cream"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {productsList.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">Todavía no hay productos acá.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {productsList.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
