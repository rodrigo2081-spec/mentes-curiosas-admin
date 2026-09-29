import Image from "next/image";

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.35-.5.05-1 .25-3.4-.71-2.88-1.15-4.71-4.08-4.85-4.27-.14-.19-1.16-1.55-1.16-2.95 0-1.4.73-2.08 1-2.37.24-.26.53-.32.7-.32.18 0 .35 0 .5.01.16.01.38-.06.6.45.24.55.8 1.93.87 2.07.07.14.11.3.02.48-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.13-.29.28-.12.55.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.28.36-.23.6-.14.25.09 1.57.74 1.84.87.27.14.45.2.51.32.07.12.07.65-.17 1.33Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.35" cy="6.65" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StoreFooter({
  whatsappNumber,
  instagramUsername,
}: {
  whatsappNumber: string;
  instagramUsername: string;
}) {
  const waLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined;
  const igLink = instagramUsername ? `https://instagram.com/${instagramUsername}` : undefined;

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
        <div className="space-y-2">
          <p className="font-semibold text-ink">Contacto</p>
          <div className="flex flex-wrap items-center gap-2">
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <WhatsappIcon className="h-4 w-4" />
                WhatsApp
              </a>
            ) : (
              <p className="text-ink/50">WhatsApp (próximamente)</p>
            )}
            {igLink && (
              <a
                href={igLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                style={{
                  background:
                    "linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)",
                }}
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
