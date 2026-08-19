"use client";

import { useActionState } from "react";
import { MediaUploader, type MediaItem } from "@/components/media-uploader";
import type { ProductFormState } from "./actions";

type Category = { id: string; name: string };

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string | null;
  isActive: boolean;
  media: MediaItem[];
};

export function ProductForm({
  action,
  categories,
  initialValues,
  submitLabel,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  initialValues?: Partial<ProductFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initialValues?.name}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialValues?.description}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-neutral-700">
            Precio
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={initialValues?.price}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-neutral-700">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={initialValues?.stock ?? 0}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700">
          Categoría
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initialValues?.categoryId ?? ""}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Fotos y videos</label>
        <div className="mt-1">
          <MediaUploader name="media" initialMedia={initialValues?.media} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initialValues?.isActive ?? true}
          className="rounded border-neutral-300"
        />
        Visible en la tienda online
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
