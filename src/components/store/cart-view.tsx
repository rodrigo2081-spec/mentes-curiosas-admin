"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCart, type CartItem } from "./cart-context";

function buildWhatsappLink(number: string, items: CartItem[], total: number) {
  const lines = items.map((i) => `• ${i.quantity}x ${i.name} — ${formatPrice(i.priceCash * i.quantity)}`);
  const text = [
    "¡Hola! Quiero hacer este pedido desde la web:",
    "",
    ...lines,
    "",
    `Total (contado): ${formatPrice(total)}`,
  ].join("\n");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function CartView({ whatsappNumber }: { whatsappNumber: string }) {
  const { items, setQuantity, removeItem, totalList, totalCash } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-ink">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-ink/60">Todavía no agregaste ningún producto.</p>
        <Link
          href="/productos"
          className="mt-6 inline-block rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white hover:bg-coral/90"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const waLink = buildWhatsappLink(whatsappNumber, items, totalCash);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-3xl text-ink">Tu carrito</h1>

      <ul className="mt-6 divide-y divide-black/5 rounded-3xl border border-black/5 bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-cream" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-ink">{item.name}</p>
              <p className="text-sm text-ink/50">{formatPrice(item.priceCash)} c/u (contado)</p>
            </div>
            <input
              type="number"
              min={1}
              max={item.stock || undefined}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value) || 1)}
              className="w-16 rounded-full border border-black/10 px-2 py-1.5 text-center text-sm"
            />
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-ink/40 hover:text-coral"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-3xl border border-black/5 bg-white p-5 text-right">
        <p className="text-sm text-ink/50">Total precio de lista: {formatPrice(totalList)}</p>
        <p className="text-2xl font-bold text-coral">Total contado: {formatPrice(totalCash)}</p>
      </div>

      <div className="mt-6 text-center">
        {whatsappNumber ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-mint px-8 py-3 text-base font-semibold text-ink shadow-sm transition hover:opacity-90"
          >
            Finalizar pedido por WhatsApp
          </a>
        ) : (
          <p className="text-sm text-ink/50">
            La tienda todavía no configuró el número de WhatsApp para pedidos.
          </p>
        )}
        <p className="mt-3 text-xs text-ink/40">
          El pedido se confirma por WhatsApp. El precio de contado aplica a pago en efectivo o
          transferencia.
        </p>
      </div>
    </div>
  );
}
