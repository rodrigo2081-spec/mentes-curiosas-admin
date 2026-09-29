import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Mentes Curiosas · Administración",
  description: "Panel de administración de stock y productos de Mentes Curiosas",
};

const navItems = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/ventas", label: "Ventas" },
  { href: "/admin/administracion", label: "Administración" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <span className="text-sm font-semibold text-neutral-900">Mentes Curiosas</span>
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Ver tienda ↗
            </Link>
            <span className="text-sm text-neutral-500">{session?.user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
