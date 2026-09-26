import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

// Configuración general (clave/valor), server-only. Por ahora solo se usa
// para la cotización del dólar, que se puede actualizar desde el panel
// (Administración) sin tener que tocar variables de entorno ni redeployar.

const DOLLAR_RATE_KEY = "dollar_rate";
const DEFAULT_DOLLAR_RATE = 1550;

export async function getDollarRate(): Promise<number> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, DOLLAR_RATE_KEY) });
  const value = row ? parseFloat(row.value) : NaN;
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DOLLAR_RATE;
}

export async function setDollarRate(rate: number): Promise<void> {
  await db
    .insert(settings)
    .values({ key: DOLLAR_RATE_KEY, value: rate.toString() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: rate.toString(), updatedAt: new Date() },
    });
}
