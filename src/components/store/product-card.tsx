"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { priceCash } from "@/lib/pricing";
import { useCart } from "./cart-context";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceList: string;
    stock: number;
    media: { url: string; type: "image" | "video" }[];
  };
};

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const image = product.media.find((m) => m.type === "image")?.url ?? null;
  const inStock = product.stock > 0;
  const cash = priceCash(product.priceList);

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
      <Link href={`/productos/${product.slug}`} className="group block aspect-square overflow-hidden bg-cream">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink/30">Sin foto</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link href={`/productos/${product.slug}`} className="font-semibold text-ink hover:text-coral">
          {product.name}
        </Link>
        <p className={`text-xs font-medium ${inStock ? "text-mint" : "text-ink/40"}`}>
          {inStock ? "En stock" : "Sin stock"}
        </p>
        <div className="mt-1">
          <p className="text-lg font-bold text-coral">
            {formatPrice(cash)} <span className="text-xs font-normal text-ink/40">contado</span>
          </p>
          <p className="text-xs text-ink/40 line-through">{formatPrice(product.priceList)}</p>
        </div>
        <button
          type="button"
          disabled={!inStock}
          onClick={() =>
            addItem(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceList: parseFloat(product.priceList),
                priceCash: cash,
                image,
                stock: product.stock,
              },
              1
            )
          }
          className="mt-3 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:bg-ink/20"
        >
          {inStock ? "Agregar al carrito" : "Sin stock"}
        </button>
      </div>
    </div>
  );
}
