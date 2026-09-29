import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mentes Curiosas · Potenciando aprendizajes",
  description:
    "Juegos educativos, didácticos y libros para la primera infancia en Villa María, Córdoba.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
