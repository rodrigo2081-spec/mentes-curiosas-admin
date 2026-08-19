"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses, profitWithdrawals, cashTransfers } from "@/db/schema";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
}

const CASH_BOXES = ["efectivo", "banco_flor", "banco_rodrigo"] as const;
const cashBoxSchema = z.enum(CASH_BOXES);

function revalidateAll() {
  revalidatePath("/admin/administracion");
  revalidatePath("/admin");
}

// ----- Gastos -----

const expenseSchema = z.object({
  description: z.string().trim().min(1, "La descripción es obligatoria"),
  category: z.string().trim().optional().default(""),
  amount: z.coerce.number().positive("El monto tiene que ser mayor a 0"),
  cashBox: cashBoxSchema,
});

export type ExpenseFormState = { error?: string };

export async function createExpense(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  await requireAdmin();
  const parsed = expenseSchema.safeParse({
    description: formData.get("description"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    cashBox: formData.get("cashBox"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  await db.insert(expenses).values({
    description: parsed.data.description,
    category: parsed.data.category || null,
    amount: parsed.data.amount.toString(),
    cashBox: parsed.data.cashBox,
  });
  revalidateAll();
  return {};
}

export async function deleteExpense(id: string) {
  await requireAdmin();
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidateAll();
}

// ----- Retiros de ganancia -----

const withdrawalSchema = z.object({
  partner: z.string().trim().min(1, "Indicá quién retira"),
  amount: z.coerce.number().positive("El monto tiene que ser mayor a 0"),
  cashBox: cashBoxSchema,
  note: z.string().trim().optional().default(""),
});

export type WithdrawalFormState = { error?: string };

export async function createWithdrawal(
  _prevState: WithdrawalFormState,
  formData: FormData
): Promise<WithdrawalFormState> {
  await requireAdmin();
  const parsed = withdrawalSchema.safeParse({
    partner: formData.get("partner"),
    amount: formData.get("amount"),
    cashBox: formData.get("cashBox"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  await db.insert(profitWithdrawals).values({
    partner: parsed.data.partner,
    amount: parsed.data.amount.toString(),
    cashBox: parsed.data.cashBox,
    note: parsed.data.note || null,
  });
  revalidateAll();
  return {};
}

export async function deleteWithdrawal(id: string) {
  await requireAdmin();
  await db.delete(profitWithdrawals).where(eq(profitWithdrawals.id, id));
  revalidateAll();
}

// ----- Transferencias entre cajas -----

const transferSchema = z
  .object({
    fromCashBox: cashBoxSchema,
    toCashBox: cashBoxSchema,
    amount: z.coerce.number().positive("El monto tiene que ser mayor a 0"),
    note: z.string().trim().optional().default(""),
  })
  .refine((data) => data.fromCashBox !== data.toCashBox, {
    message: "Elegí dos cajas distintas",
    path: ["toCashBox"],
  });

export type TransferFormState = { error?: string };

export async function createTransfer(
  _prevState: TransferFormState,
  formData: FormData
): Promise<TransferFormState> {
  await requireAdmin();
  const parsed = transferSchema.safeParse({
    fromCashBox: formData.get("fromCashBox"),
    toCashBox: formData.get("toCashBox"),
    amount: formData.get("amount"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  await db.insert(cashTransfers).values({
    fromCashBox: parsed.data.fromCashBox,
    toCashBox: parsed.data.toCashBox,
    amount: parsed.data.amount.toString(),
    note: parsed.data.note || null,
  });
  revalidateAll();
  return {};
}

export async function deleteTransfer(id: string) {
  await requireAdmin();
  await db.delete(cashTransfers).where(eq(cashTransfers.id, id));
  revalidateAll();
}
