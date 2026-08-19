"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export type MediaItem = {
  type: "image" | "video";
  url: string;
};

type PendingItem = MediaItem & {
  key: string;
  status: "uploading" | "done" | "error";
  error?: string;
};

export function MediaUploader({
  name,
  initialMedia = [],
}: {
  name: string;
  initialMedia?: MediaItem[];
}) {
  const [items, setItems] = useState<PendingItem[]>(
    initialMedia.map((m, i) => ({ ...m, key: `initial-${i}`, status: "done" }))
  );

  async function handleFiles(files: FileList | null, type: "image" | "video") {
    if (!files || files.length === 0) return;

    const newEntries: PendingItem[] = Array.from(files).map((file) => ({
      key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      type,
      url: "",
      status: "uploading",
    }));
    setItems((prev) => [...prev, ...newEntries]);

    await Promise.all(
      Array.from(files).map(async (file, idx) => {
        const key = newEntries[idx].key;
        try {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            clientPayload: type,
          });
          setItems((prev) =>
            prev.map((it) => (it.key === key ? { ...it, url: blob.url, status: "done" } : it))
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error al subir";
          setItems((prev) =>
            prev.map((it) => (it.key === key ? { ...it, status: "error", error: message } : it))
          );
        }
      })
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  const completedMedia: MediaItem[] = items
    .filter((it) => it.status === "done")
    .map(({ type, url }) => ({ type, url }));

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(completedMedia)} />

      <div className="flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-md border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50">
          + Agregar fotos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files, "image")}
          />
        </label>
        <label className="cursor-pointer rounded-md border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50">
          + Agregar video
          <input
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files, "video")}
          />
        </label>
      </div>

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.key}
              className="relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-50"
            >
              {item.status === "uploading" && (
                <div className="flex h-28 items-center justify-center text-xs text-neutral-500">
                  Subiendo…
                </div>
              )}
              {item.status === "error" && (
                <div className="flex h-28 flex-col items-center justify-center gap-1 p-2 text-center text-xs text-red-600">
                  <span>Error al subir</span>
                  <span className="line-clamp-2">{item.error}</span>
                </div>
              )}
              {item.status === "done" && item.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="h-28 w-full object-cover" />
              )}
              {item.status === "done" && item.type === "video" && (
                <video src={item.url} className="h-28 w-full object-cover" muted />
              )}
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
