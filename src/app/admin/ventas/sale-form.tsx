"use client";

import { useActionState, useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS, priceForPaymentMethod, type PaymentMethod } from "@/lib/pricing";
import { createSale, type SaleFormState } from "./actions";

type Product = {
  id: string;
  name: string;
  priceList: string;
  stock: number;
};

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  stock: number;
  priceList: string;
};

export function SaleForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState<SaleFormState, FormData>(createSale, {});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const cartWithPrices = useMemo(
    () =>
      cart.map((item) => ({
        ...item,
        unitPrice: priceForPaymentMethod(item.priceList, paymentMethod),
      })),
    [cart, paymentMethod]
  );
  const total = cartWithPrices.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartJson = JSON.stringify(
    cart.map((item) => ({ productId: item.productId, quantity: item.quantity }))
  );

  function addToCart() {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product || quantity < 1) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity,
          stock: product.stock,
          priceList: product.priceList,
        },
      ];
    });
    setSelectedProductId("");
    setQuantity(1);
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="cart" value={cartJson} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-neutral-700">
            Nombre del cliente
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-neutral-700">
            Teléfono
          </label>
          <input
            id="customerPhone"
            name="customerPhone"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-neutral-700">
            Email <span className="text-neutral-400">(opcional)</span>
          </label>
          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="customerAddress" className="block text-sm font-medium text-neutral-700">
            Dirección <span className="text-neutral-400">(opcional)</span>
          </label>
          <input
            id="customerAddress"
            name="customerAddress"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-neutral-700">
          Método de pago
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-neutral-500">
          {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.cashDiscount
            ? "Se aplica el precio de contado (10% off)."
            : "Se cobra el precio de lista (sin descuento)."}
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 p-4">
        <p className="mb-3 text-sm font-medium text-neutral-700">Productos</p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="productSelect" className="block text-xs text-neutral-500">
              Producto
            </label>
            <select
              id="productSelect"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            >
              <option value="">Elegir producto…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} {p.stock === 0 ? "(sin stock)" : `(stock: ${p.stock})`}
                </option>
              ))}
            </select>
          </div>
          <div className="w-20">
            <label htmlFor="quantity" className="block text-xs text-neutral-500">
              Cant.
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={!selectedProductId}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Agregar
          </button>
        </div>

        {cartWithPrices.length > 0 && (
          <ul className="mt-4 divide-y divide-neutral-100 text-sm">
            {cartWithPrices.map((item) => (
              <li key={item.productId} className="flex items-center justify-between py-2">
                <span className="text-neutral-700">
                  {item.quantity} × {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-600">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-right text-base font-semibold text-neutral-900">
          Total: {formatPrice(total)}
        </p>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-neutral-700">
          Nota <span className="text-neutral-400">(opcional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || cart.length === 0}
        className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Registrar venta"}
      </button>
    </form>
  );
}
