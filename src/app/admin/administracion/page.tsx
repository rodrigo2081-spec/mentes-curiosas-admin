import { db } from "@/db";
import { formatPrice } from "@/lib/utils";
import { CASH_BOX_LABELS } from "@/lib/pricing";
import { computeCashBoxBalances } from "@/lib/cashbox-balances";
import { getDollarRate, getWhatsappNumber } from "@/lib/settings";
import { deleteExpense, deleteWithdrawal, deleteTransfer } from "./actions";
import {
  ExpenseForm,
  WithdrawalForm,
  TransferForm,
  DollarRateForm,
  WhatsappNumberForm,
} from "./forms";
import { DeleteButton } from "../productos/delete-button";

export const dynamic = "force-dynamic";

export default async function AdministracionPage() {
  const [balances, recentExpenses, recentWithdrawals, recentTransfers, dollarRate, whatsappNumber] =
    await Promise.all([
      computeCashBoxBalances(),
      db.query.expenses.findMany({ orderBy: (e, { desc }) => [desc(e.date)], limit: 15 }),
      db.query.profitWithdrawals.findMany({
        orderBy: (w, { desc }) => [desc(w.date)],
        limit: 15,
      }),
      db.query.cashTransfers.findMany({ orderBy: (t, { desc }) => [desc(t.date)], limit: 15 }),
      getDollarRate(),
      getWhatsappNumber(),
    ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Administración</h1>
        <p className="text-sm text-neutral-500">Cajas, gastos, retiros, traspasos y cotización del dólar</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Cotización del dólar</h2>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-sm text-neutral-600">
            Cotización actual: <span className="font-medium text-neutral-900">{formatPrice(dollarRate)}</span> por USD
          </p>
          <DollarRateForm currentRate={dollarRate} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">WhatsApp de la tienda</h2>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-sm text-neutral-600">
            {whatsappNumber
              ? "Los pedidos del carrito online se mandan a este número."
              : "Todavía no configuraste el número: el botón de la tienda no va a funcionar hasta que lo cargues."}
          </p>
          <WhatsappNumberForm currentNumber={whatsappNumber} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(Object.entries(CASH_BOX_LABELS) as [keyof typeof CASH_BOX_LABELS, string][]).map(
          ([key, label]) => (
            <div key={key} className="rounded-lg border border-neutral-200 bg-white p-4">
              <p
                className={`text-2xl font-semibold ${balances[key] < 0 ? "text-red-600" : "text-neutral-900"}`}
              >
                {formatPrice(balances[key])}
              </p>
              <p className="text-sm text-neutral-500">{label}</p>
            </div>
          )
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Gastos</h2>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <ExpenseForm />
        </div>
        {recentExpenses.length > 0 && (
          <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {recentExpenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-neutral-900">{e.description}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(e.date).toLocaleDateString("es-AR")} · {CASH_BOX_LABELS[e.cashBox]}
                    {e.category ? ` · ${e.category}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-neutral-900">{formatPrice(e.amount)}</span>
                  <DeleteButton id={e.id} name={e.description} action={deleteExpense} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Retiros de ganancia</h2>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <WithdrawalForm />
        </div>
        {recentWithdrawals.length > 0 && (
          <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {recentWithdrawals.map((w) => (
              <li key={w.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-neutral-900">{w.partner}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(w.date).toLocaleDateString("es-AR")} · {CASH_BOX_LABELS[w.cashBox]}
                    {w.note ? ` · ${w.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-neutral-900">{formatPrice(w.amount)}</span>
                  <DeleteButton id={w.id} name={`el retiro de ${w.partner}`} action={deleteWithdrawal} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Traspasos entre cajas</h2>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <TransferForm />
        </div>
        {recentTransfers.length > 0 && (
          <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-sm">
            {recentTransfers.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-neutral-900">
                    {CASH_BOX_LABELS[t.fromCashBox]} → {CASH_BOX_LABELS[t.toCashBox]}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(t.date).toLocaleDateString("es-AR")}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-neutral-900">{formatPrice(t.amount)}</span>
                  <DeleteButton
                    id={t.id}
                    name={`el traspaso de ${formatPrice(t.amount)}`}
                    action={deleteTransfer}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
