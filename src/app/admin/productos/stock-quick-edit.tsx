"use client";

import { useState, useTransition } from "react";
import { updateStock } from "./actions";

export function StockQuickEdit({ id, stock }: { id: string; stock: number }) {
  const [value, setValue] = useState(stock);
  const [isPending, startTransition] = useTransition();
  const dirty = value !== stock;

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      {dirty && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => updateStock(id, value))}
          className="text-xs font-medium text-neutral-900 underline disabled:opacity-50"
        >
          Guardar
        </button>
      )}
    </div>
  );
}
