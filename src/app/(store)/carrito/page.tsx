import { getWhatsappNumber } from "@/lib/settings";
import { CartView } from "@/components/store/cart-view";

export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const whatsappNumber = await getWhatsappNumber();
  return <CartView whatsappNumber={whatsappNumber} />;
}
