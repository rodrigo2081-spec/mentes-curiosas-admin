import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mentes Curiosas · Administración",
  description: "Panel de administración de stock y productos de Mentes Curiosas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
