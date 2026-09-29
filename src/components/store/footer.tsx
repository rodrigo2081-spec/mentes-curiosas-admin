import Image from "next/image";

export function StoreFooter({ whatsappNumber }: { whatsappNumber: string }) {
  const waLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined;

  return (
    <footer className="mt-16 border-t-[3px] border-dashed border-black/10 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-ink/80 sm:grid-cols-3">
        <div>
          <Image
            src="/mentes-curiosas-logo.png"
            alt="Mentes Curiosas"
            width={511}
            height={155}
            className="h-7 w-auto"
          />
          <p className="mt-2 text-ink/60">Potenciando aprendizajes 🌈🧡✨</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-ink">Horario</p>
          <p>Lunes a viernes, 8 a 13 y 16 a 20</p>
          <p>Sábados, 9 a 12 y 17 a 20</p>
          <p className="mt-3 font-semibold text-ink">Dirección</p>
          <p>Salta 2199, Villa María</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-ink">Contacto</p>
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-petrol hover:underline"
            >
              Escribinos por WhatsApp
            </a>
          ) : (
            <p className="text-ink/50">WhatsApp (próximamente)</p>
          )}
        </div>
      </div>
    </footer>
  );
}
