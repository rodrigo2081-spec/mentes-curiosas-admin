import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { roundToHundred, toNumber } from "@/lib/pricing";

// Endpoint temporal de mantenimiento: redondea a la centena más cercana el
// Precio de Lista de TODOS los productos ya cargados (con categoría, sin
// categoría, precio automático o manual), sin importar cómo se calculó.
// Se borra apenas se confirma que corrió bien.
export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("confirm") !== "1") {
    return NextResponse.json({ error: "Falta ?confirm=1" }, { status: 400 });
  }

  const all = await db.query.products.findMany();

  const updated: { id: string; name: string; before: string; after: string }[] = [];

  for (const p of all) {
    const before = toNumber(p.priceList);
    const after = roundToHundred(before);
    if (before !== after) {
      await db
        .update(products)
        .set({ priceList: after.toString(), updatedAt: new Date() })
        .where(eq(products.id, p.id));
      updated.push({ id: p.id, name: p.name, before: p.priceList, after: after.toString() });
    }
  }

  return NextResponse.json({ totalProducts: all.length, updatedCount: updated.length, updated });
}
