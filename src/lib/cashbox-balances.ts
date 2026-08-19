import { db } from "@/db";
import { toNumber, type CashBox } from "@/lib/pricing";

export async function computeCashBoxBalances(): Promise<Record<CashBox, number>> {
  const [allSales, allExpenses, allWithdrawals, allTransfers] = await Promise.all([
    db.query.sales.findMany({ columns: { cashBox: true, totalAmount: true } }),
    db.query.expenses.findMany({ columns: { cashBox: true, amount: true } }),
    db.query.profitWithdrawals.findMany({ columns: { cashBox: true, amount: true } }),
    db.query.cashTransfers.findMany({
      columns: { fromCashBox: true, toCashBox: true, amount: true },
    }),
  ]);

  const balances: Record<CashBox, number> = {
    efectivo: 0,
    banco_flor: 0,
    banco_rodrigo: 0,
  };

  for (const s of allSales) balances[s.cashBox] += toNumber(s.totalAmount);
  for (const e of allExpenses) balances[e.cashBox] -= toNumber(e.amount);
  for (const w of allWithdrawals) balances[w.cashBox] -= toNumber(w.amount);
  for (const t of allTransfers) {
    balances[t.fromCashBox] -= toNumber(t.amount);
    balances[t.toCashBox] += toNumber(t.amount);
  }

  return balances;
}
