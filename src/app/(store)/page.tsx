import Link from "next/link";
import { getFeaturedProducts, getStoreCategories } from "@/lib/store-data";
import { ProductCard } from "@/components/store/product-card";
import { HeroCarousel } from "@/components/store/hero-carousel";

const PASTELS = ["bg-pink-pastel", "bg-yellow-pastel", "bg-mint-pastel", "bg-lavender-pastel", "bg-sky-pastel"];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(8), getStoreCategories()]);

  return (
    <div className="space-y-16 pb-16">
      <section className="px-4 pt-8">
        <HeroCarousel />
      </section>

      <section className="px-4 text-center">
        <p className="mx-auto max-w-2xl font-script text-2xl font-semibold leading-snug text-coral sm:text-3xl">
          jugar es la forma satisfactoria de nuestro cerebro para aprender...
        </p>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <h2 className="font-heading text-2xl text-ink">Categorías</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((c, i) => (
              <Link
                key={c.slug}
                href={`/productos?categoria=${c.slug}`}
                className={`rounded-3xl border border-black/5 p-6 text-center font-semibold text-ink transition hover:-translate-y-0.5 ${PASTELS[i % PASTELS.length]}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-2xl text-ink">Novedades</h2>
            <Link href="/productos" className="text-sm font-medium text-petrol hover:underline">
              Ver todo
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
