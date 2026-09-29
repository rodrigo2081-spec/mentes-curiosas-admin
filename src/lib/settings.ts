import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

// Configuración general (clave/valor), server-only. Se usa para la
// cotización del dólar (actualizable desde Administración) y para el
// contador de códigos automáticos de producto.

const DOLLAR_RATE_KEY = "dollar_rate";
const DEFAULT_DOLLAR_RATE = 1550;
const PRODUCT_CODE_SEQ_KEY = "product_code_seq";
const WHATSAPP_NUMBER_KEY = "whatsapp_number";
const INSTAGRAM_URL_KEY = "instagram_url";

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

// Número de WhatsApp del negocio (solo dígitos, con código de país, ej:
// "5493534123456"), usado por el botón de checkout de la tienda online.
// Se edita desde Administración, no hace falta redeployar para cambiarlo.
export async function getWhatsappNumber(): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, WHATSAPP_NUMBER_KEY) });
  return row?.value.trim() ?? "";
}

export async function setWhatsappNumber(number: string): Promise<void> {
  const digits = number.replace(/[^0-9]/g, "");
  await db
    .insert(settings)
    .values({ key: WHATSAPP_NUMBER_KEY, value: digits })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: digits, updatedAt: new Date() },
    });
}

// Usuario de Instagram del negocio (solo el @, sin arroba, ej: "mentescuriosas"),
// usado por el botón de Instagram del footer de la tienda online. Se edita
// desde Administración, no hace falta redeployar para cambiarlo.
export async function getInstagramUsername(): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, INSTAGRAM_URL_KEY) });
  return row?.value.trim() ?? "";
}

export async function setInstagramUsername(username: string): Promise<void> {
  // Acepta que peguen el @, la URL completa o solo el usuario; nos quedamos
  // solo con el usuario.
  const clean = username
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  await db
    .insert(settings)
    .values({ key: INSTAGRAM_URL_KEY, value: clean })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: clean, updatedAt: new Date() },
    });
}
