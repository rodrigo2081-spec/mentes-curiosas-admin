"use client";

import { useTransition } from "react";
import { toggleActive } from "./actions";

export function ActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleActive(id, !isActive))}
      className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
        isActive
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
      }`}
    >
      {isActive ? "Publicado" : "Oculto"}
    </button>
  );
}
