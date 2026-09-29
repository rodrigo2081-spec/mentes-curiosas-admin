"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Carrusel de la portada: pensado para publicitar productos con fotos reales
// (se cargan más adelante); por ahora los demás slides muestran un fondo
// pastel de marca a modo de placeholder. Slide 0 es la imagen compuesta con
// fotos reales de producto + info de envío/pagos, armada a medida; se
// muestra completa (object-contain) sobre fondo crema para que no se recorte
// en ningún tamaño de pantalla, y toda la imagen es un link al catálogo.
const SLIDES = [
  { bg: "bg-cream" },
  { bg: "bg-pink-pastel", caption: "Nuevos ingresos de la semana" },
  { bg: "bg-mint-pastel", caption: "Elegidos con mirada de psicopedagoga" },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const n = SLIDES.length;
  const go = (i: number) => setActive(((i % n) + n) % n);

  return (
    <div className="relative h-[300px] overflow-hidden rounded-[32px] sm:h-[420px]">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center transition-opacity duration-300 ${slide.bg} ${
            i === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {i === 0 ? (
            <Link href="/productos" className="relative block h-full w-full" aria-label="Ver catálogo">
              <Image
                src="/carousel-slide-1.jpg"
                alt="Envío a todo el país. Efectivo o transferencia: 10% de descuento. Se aceptan tarjetas de crédito."
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </Link>
          ) : (
            <>
              <div className="flex h-[140px] w-[220px] items-center justify-center rounded-3xl bg-white text-sm font-semibold text-ink/30 sm:h-[220px] sm:w-[300px]">
                Foto de producto
              </div>
              <p className="font-heading text-lg font-bold text-ink sm:text-2xl">{slide.caption}</p>
            </>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => go(active - 1)}
        aria-label="Diapositiva anterior"
        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg font-bold text-ink shadow-md"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(active + 1)}
        aria-label="Diapositiva siguiente"
        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg font-bold text-ink shadow-md"
      >
        ›
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            className={`h-[11px] w-[11px] rounded-full ${i === active ? "bg-coral" : "bg-ink/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
