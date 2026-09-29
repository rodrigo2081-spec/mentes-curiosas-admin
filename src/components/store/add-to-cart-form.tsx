"use client";

import { useState } from "react";
import { priceCash } from "@/lib/pricing";
import { useCart } from "./cart-context";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceList: string;
    stock: number;
    image: string | null;
  };
};

export function AddToCartForm({ product }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inStock = product.stock > 0;

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        max={product.stock || 1}
        value={qty}
        disabled={!inStock}
        onChange={(e) =>
          setQty(Math.max(1, Math.min(product.stock || 1, Number(e.target.value) || 1)))
        }
        className="w-20 rounded-full border border-black/10 px-3 py-2 text-center text-sm disabled:opacity-50"
      />
      <button
        type="button"
        disabled={!inStock}
        onClick={() => {
          addItem(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceList: parseFloat(product.priceList),
              priceCash: priceCash(product.priceList),
              image: product.image,
              stock: product.stock,
            },
            qty
          );
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:bg-ink/20"
      >
        {!inStock ? "Sin stock" : added ? "¡Agregado! 🧡" : "Agregar al carrito"}
      </button>
    </div>
  );
}
