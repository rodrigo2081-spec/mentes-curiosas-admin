import Link from "next/link";
import { getFeaturedProducts, getStoreCategories } from "@/lib/store-data";
import { ProductCard } from "@/components/store/product-card";

const PASTELS = ["bg-pink-pastel", "bg-yellow-pastel", "bg-mint-pastel", "bg-lavender-pastel", "bg-sky-pastel"];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(8), getStoreCategories()]);

  return (
    <div className="space-y-16 pb-16">
      <section className="px-4 pt-14 pb-16 text-center sm:pt-20">
        <div className="mx-auto max-w-2xl">
          <p className="font-accent text-lg text-iris">Un mundo de</p>
          <h1 className="font-heading text-5xl font-bold leading-tight text-coral sm:text-6xl">
            jugar
          </h1>
          <p className="font-accent text-lg text-petrol">en un solo lugar</p>
          <p className="mx-auto mt-6 max-w-xl text-base text-ink/70">
            Juegos educativos, didácticos y libros para acompañar a cada chico desde los primeros
            meses. Elegidos con mirada de psicopedagoga.
          </p>
          <Link
            href="/productos"
            className="mt-8 inline-block rounded-full bg-coral px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-coral/90"
          >
            Ver catálogo
          </Link>
        </div>
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
