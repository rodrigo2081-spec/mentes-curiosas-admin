import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getDollarRate } from "@/lib/settings";
import { totalCost, roundToHundred } from "@/lib/pricing";

// Endpoint temporal de mantenimiento: recalcula el Precio de Lista de todos
// los productos con precio automático (categoría sin "precio manual"),
// aplicando el nuevo redondeo a la centena. No toca productos de categorías
// con precio manual (ej. Libro) ni sin categoría (se tratan como precio
// manual: nadie define el "doble del costo" para ellos). Se borra apenas
// se confirma que corrió bien. Requiere ?confirm=1 para evitar que lo
// dispare un crawler mientras está deployado.
export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("confirm") !== "1") {
    return NextResponse.json({ error: "Falta ?confirm=1" }, { status: 400 });
  }
  return recalc();
}

async function recalc() {
  const dollarRate = await getDollarRate();

  const all = await db.query.products.findMany({
    with: { category: true },
  });

  const updated: { id: string; name: string; before: string; after: string }[] = [];
  const skipped: { id: string; name: string; reason: string }[] = [];

  for (const p of all) {
    if (!p.categoryId || p.category?.manualPriceList) {
      skipped.push({
        id: p.id,
        name: p.name,
        reason: !p.categoryId ? "sin categoría" : "precio manual",
      });
      continue;
    }

    const cost = totalCost(
      {
        costProduct: p.costProduct,
        costShipping: p.costShipping,
        costAdditional: p.costAdditional,
        costCurrency: p.costCurrency,
        commissionPercent: p.commissionPercent,
      },
      dollarRate
    );
    const newPriceList = roundToHundred(cost * 2);
    const before = p.priceList;

    if (Number(before) !== newPriceList) {
      await db
        .update(products)
        .set({ priceList: newPriceList.toString(), updatedAt: new Date() })
        .where(eq(products.id, p.id));
    }

    updated.push({ id: p.id, name: p.name, before, after: newPriceList.toString() });
  }

  return NextResponse.json({ totalProducts: all.length, updatedCount: updated.length, updated, skipped });
}
