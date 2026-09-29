import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/store-data";
import { formatPrice } from "@/lib/utils";
import { priceCash } from "@/lib/pricing";
import { AddToCartForm } from "@/components/store/add-to-cart-form";

export const dynamic = "force-dynamic";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cash = priceCash(product.priceList);

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="space-y-3">
        {product.media.length > 0 ? (
          <div className="grid gap-3">
            {product.media.map((m) =>
              m.type === "video" ? (
                <video key={m.id} src={m.url} controls className="w-full rounded-3xl bg-black" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={m.url}
                  alt={product.name}
                  className="w-full rounded-3xl object-cover"
                />
              )
            )}
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-white text-ink/30">
            Sin foto
          </div>
        )}
      </div>

      <div className="space-y-4">
        {product.category && (
          <span className="inline-block rounded-full bg-lavender-pastel px-3 py-1 text-xs font-semibold text-iris">
            {product.category.name}
          </span>
        )}
        <h1 className="font-heading text-3xl text-ink">{product.name}</h1>

        <div>
          <p className="text-2xl font-bold text-coral">
            {formatPrice(cash)} <span className="text-sm font-normal text-ink/40">contado</span>
          </p>
          <p className="text-sm text-ink/40 line-through">{formatPrice(product.priceList)}</p>
        </div>

        <p className={`text-sm font-medium ${product.stock > 0 ? "text-mint" : "text-ink/40"}`}>
          {product.stock > 0 ? "En stock" : "Sin stock"}
        </p>

        {product.ageRange && (
          <p className="text-sm text-ink/70">
            <span className="font-semibold text-ink">Edad recomendada:</span> {product.ageRange}
          </p>
        )}
        {product.learningSkills && (
          <p className="text-sm text-ink/70">
            <span className="font-semibold text-ink">Qué aprende:</span> {product.learningSkills}
          </p>
        )}
        {product.description && (
          <p className="text-sm leading-relaxed text-ink/70">{product.description}</p>
        )}

        <AddToCartForm
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            priceList: product.priceList,
            stock: product.stock,
            image: product.media.find((m) => m.type === "image")?.url ?? null,
          }}
        />

        <p className="text-xs text-ink/40">
          Precio de contado válido para pago en efectivo o transferencia.
        </p>
      </div>
    </div>
  );
}
