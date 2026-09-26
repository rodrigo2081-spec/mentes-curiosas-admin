"use client";

import { useTransition } from "react";
import { toggleManualPriceList } from "./actions";

export function ManualPriceToggle({ id, manualPriceList }: { id: string; manualPriceList: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleManualPriceList(id, !manualPriceList))}
      title="El Precio de Lista se carga a mano en vez de calcularse x2 sobre el costo"
      className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
        manualPriceList
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
      }`}
    >
      {manualPriceList ? "Precio manual" : "Precio automático (x2)"}
    </button>
  );
}
