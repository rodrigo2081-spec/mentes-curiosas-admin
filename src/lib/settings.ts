import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

// Configuración general (clave/valor), server-only. Se usa para la
// cotización del dólar (actualizable desde Administración) y para el
// contador de códigos automáticos de producto.

const DOLLAR_RATE_KEY = "dollar_rate";
const DEFAULT_DOLLAR_RATE = 1550;
const PRODUCT_CODE_SEQ_KEY = "product_code_seq";

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

// Próximo código de producto ("0001", "0002", ...). Es un contador global
// que se incrementa de forma atómica en la base (INSERT ... ON CONFLICT),
// así que dos cargas al mismo tiempo nunca reciben el mismo número.
export async function getNextProductCode(): Promise<string> {
  const [row] = await db
    .insert(settings)
    .values({ key: PRODUCT_CODE_SEQ_KEY, value: "1" })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: sql`(${settings.value}::int + 1)::text`,
        updatedAt: new Date(),
      },
    })
    .returning({ value: settings.value });

  const seq = row ? parseInt(row.value, 10) : 1;
  const safeSeq = Number.isFinite(seq) && seq > 0 ? seq : 1;
  return safeSeq.toString().padStart(4, "0");
}
