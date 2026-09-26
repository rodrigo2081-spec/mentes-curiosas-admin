"use client";

import { useActionState, useRef, useEffect } from "react";
import { CASH_BOX_LABELS } from "@/lib/pricing";
import {
  createExpense,
  createWithdrawal,
  createTransfer,
  updateDollarRate,
  type ExpenseFormState,
  type WithdrawalFormState,
  type TransferFormState,
  type DollarRateFormState,
} from "./actions";

const cashBoxOptions = Object.entries(CASH_BOX_LABELS) as [keyof typeof CASH_BOX_LABELS, string][];

function useResetOnSuccess<T extends { error?: string }>(pending: boolean, state: T) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!pending && !state?.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);
  return formRef;
}

export function DollarRateForm({ currentRate }: { currentRate: number }) {
  const [state, formAction, pending] = useActionState<DollarRateFormState, FormData>(
    updateDollarRate,
    {}
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="dollarRate" className="block text-xs text-neutral-500">
          1 USD = $ ARS
        </label>
        <input
          id="dollarRate"
          name="dollarRate"
          type="number"
          step="0.01"
          min={0.01}
          defaultValue={currentRate}
          required
          className="mt-1 w-40 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Actualizar cotización"}
      </button>
      <p className="w-full text-xs text-neutral-500">
        Se usa para convertir a pesos el costo de los productos cargados en dólares.
      </p>
    </form>
  );
}

export function ExpenseForm() {
  const [state, formAction, pending] = useActionState<ExpenseFormState, FormData>(
    createExpense,
    {}
  );
  const formRef = useResetOnSuccess(pending, state);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          name="description"
          placeholder="Descripción (ej: pauta Instagram)"
          required
          className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <input
          name="category"
          placeholder="Categoría (opcional)"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <input
          name="amount"
          type="number"
          step="0.01"
          min={0.01}
          placeholder="Monto"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <select
          name="cashBox"
          required
          defaultValue=""
          className="col-span-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          <option value="" disabled>
            ¿De qué caja sale?
          </option>
          {cashBoxOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        Registrar gasto
      </button>
    </form>
  );
}

export function WithdrawalForm() {
  const [state, formAction, pending] = useActionState<WithdrawalFormState, FormData>(
    createWithdrawal,
    {}
  );
  const formRef = useResetOnSuccess(pending, state);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          name="partner"
          placeholder="Socio (ej: Rodrigo)"
          required
          list="partner-suggestions"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <datalist id="partner-suggestions">
          <option value="Rodrigo" />
          <option value="Flor" />
        </datalist>
        <input
          name="amount"
          type="number"
          step="0.01"
          min={0.01}
          placeholder="Monto"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <select
          name="cashBox"
          required
          defaultValue=""
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          <option value="" disabled>
            ¿De qué caja sale?
          </option>
          {cashBoxOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          name="note"
          placeholder="Nota (opcional)"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        Registrar retiro
      </button>
    </form>
  );
}

export function TransferForm() {
  const [state, formAction, pending] = useActionState<TransferFormState, FormData>(
    createTransfer,
    {}
  );
  const formRef = useResetOnSuccess(pending, state);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select
          name="fromCashBox"
          required
          defaultValue=""
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          <option value="" disabled>
            Desde…
          </option>
          {cashBoxOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="toCashBox"
          required
          defaultValue=""
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        >
          <option value="" disabled>
            Hacia…
          </option>
          {cashBoxOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          name="amount"
          type="number"
          step="0.01"
          min={0.01}
          placeholder="Monto"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <input
          name="note"
          placeholder="Nota (opcional)"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        Registrar traspaso
      </button>
    </form>
  );
}
