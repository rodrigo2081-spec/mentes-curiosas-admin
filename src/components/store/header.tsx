"use client";

import Link from "next/link";
import { useCart } from "./cart-context";

type Category = { slug: string; name: string };

export function StoreHeader({ categories }: { categories: Category[] }) {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-heading text-xl font-semibold text-ink">
          Mentes <span className="text-coral">Curiosas</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 text-sm font-medium text-ink/80 md:flex">
          <Link href="/productos" className="rounded-full px-3 py-1.5 hover:bg-white">
            Catálogo
          </Link>
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/productos?categoria=${c.slug}`}
              className="rounded-full px-3 py-1.5 hover:bg-white"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/carrito"
          className="relative flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-coral/90"
        >
          Carrito
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-coral">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
