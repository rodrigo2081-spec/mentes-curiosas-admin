"use client";

import { useTransition } from "react";

export function DeleteButton({
  id,
  name,
  action,
}: {
  id: string;
  name: string;
  action: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
          startTransition(() => action(id));
        }
      }}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
