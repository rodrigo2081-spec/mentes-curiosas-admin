export const CASH_DISCOUNT_RATE = 0.1;

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const num = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(num) ? num : 0;
}

// Redondeo a la centena más cercana (ej: 13.560 -> 13.600, 28.706 -> 28.700).
// Se aplica a todo precio calculado (precio de lista automático, precio de
// contado) para que los precios de venta siempre terminen en "00".
export function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

export type Currency = "ars" | "usd";

export const CURRENCY_LABELS: Record<Currency, string> = {
  ars: "Pesos (ARS)",
  usd: "Dólares (USD)",
};

export type ProductCostFields = {
  costProduct: string | number;
  costShipping: string | number;
  costAdditional: string | number;
  costCurrency: Currency;
  commissionPercent?: string | number | null;
};

// La moneda (pesos/dólares) aplica únicamente al costo de la mercadería.
// Flete y costo adicional siempre están en pesos.
export function merchCostArs(product: ProductCostFields, dollarRate: number): number {
  const raw = toNumber(product.costProduct);
  return product.costCurrency === "usd" ? raw * dollarRate : raw;
}

// Costo base en pesos: mercadería (convertida si corresponde) + flete + costo
// adicional (ambos siempre en pesos). `dollarRate` es el valor de 1 USD en pesos.
export function baseCostArs(product: ProductCostFields, dollarRate: number): number {
  return (
    merchCostArs(product, dollarRate) +
    toNumber(product.costShipping) +
    toNumber(product.costAdditional)
  );
}

// Monto de la comisión adicional (%), calculado sobre el costo base ya
// convertido a pesos.
export function commissionAmountArs(product: ProductCostFields, dollarRate: number): number {
  return baseCostArs(product, dollarRate) * (toNumber(product.commissionPercent) / 100);
}

// Costo total en pesos: costo base (convertido si corresponde) + comisión.
export function totalCost(product: ProductCostFields, dollarRate: number): number {
  return baseCostArs(product, dollarRate) + commissionAmountArs(product, dollarRate);
}

export function priceCash(priceList: string | number): number {
  return roundToHundred(toNumber(priceList) * (1 - CASH_DISCOUNT_RATE));
}

export const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo", cashBox: "efectivo", cashDiscount: true },
  {
    value: "transferencia_flor",
    label: "Transferencia (Banco Flor)",
    cashBox: "banco_flor",
    cashDiscount: true,
  },
  {
    value: "transferencia_rodrigo",
    label: "Transferencia (Banco Rodrigo)",
    cashBox: "banco_rodrigo",
    cashDiscount: true,
  },
  { value: "tarjeta", label: "Tarjeta", cashBox: "banco_flor", cashDiscount: false },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];
export type CashBox = "efectivo" | "banco_flor" | "banco_rodrigo";

export const CASH_BOX_LABELS: Record<CashBox, string> = {
  efectivo: "Efectivo",
  banco_flor: "Banco Flor",
  banco_rodrigo: "Banco Rodrigo",
};

export function cashBoxForPaymentMethod(method: PaymentMethod): CashBox {
  const found = PAYMENT_METHODS.find((m) => m.value === method);
  return (found?.cashBox as CashBox) ?? "efectivo";
}

// Precio aplicado a una venta según el método de pago: contado (10% off) para
// efectivo/transferencia, precio de lista para tarjeta.
export function priceForPaymentMethod(priceList: string | number, method: PaymentMethod): number {
  const found = PAYMENT_METHODS.find((m) => m.value === method);
  return found?.cashDiscount ? priceCash(priceList) : toNumber(priceList);
}

export function paymentMethodLabel(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}
