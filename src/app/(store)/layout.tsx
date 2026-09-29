import { getStoreCategories } from "@/lib/store-data";
import { getWhatsappNumber, getInstagramUsername } from "@/lib/settings";
import { caveat, fredoka, nunito, playpenSans } from "@/lib/store-fonts";
import { CartProvider } from "@/components/store/cart-context";
import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mentes Curiosas · Potenciando aprendizajes",
  description:
    "Juegos educativos, didácticos y libros para la primera infancia en Villa María, Córdoba.",
};

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, whatsappNumber, instagramUsername] = await Promise.all([
    getStoreCategories(),
    getWhatsappNumber(),
    getInstagramUsername(),
  ]);

  return (
    <div
      className={`${fredoka.variable} ${nunito.variable} ${playpenSans.variable} ${caveat.variable} min-h-screen bg-cream font-body text-ink`}
    >
      <CartProvider>
        <StoreHeader categories={categories} />
        <main>{children}</main>
        <StoreFooter whatsappNumber={whatsappNumber} instagramUsername={instagramUsername} />
      </CartProvider>
    </div>
  );
}
