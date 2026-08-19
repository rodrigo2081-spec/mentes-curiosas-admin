"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCategory, type CategoryFormState } from "./actions";

export function NewCategoryForm() {
  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(
    createCategory,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-start gap-2">
      <div className="flex-1">
        <input
          name="name"
          placeholder="Nombre de la categoría"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        {state?.error && <p className="mt-1 text-sm text-red-600">{state.error}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        Agregar
      </button>
    </form>
  );
}
