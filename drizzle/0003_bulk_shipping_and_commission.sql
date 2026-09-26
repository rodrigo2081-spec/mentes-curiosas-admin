-- Custom SQL migration file, put your code below! --

-- Carga masiva pedida por Rodrigo: a todos los productos existentes se les
-- agrega un flete de $1700 (pesos) por unidad y una comisión del 15% sobre
-- el costo. Si el producto tiene sus costos en dólares, el flete ($1700 ARS)
-- se convierte a dólares con la cotización vigente para que, al recalcularse
-- a pesos, siga representando $1700.
UPDATE "products" SET
  "cost_shipping" = CASE
    WHEN "cost_currency" = 'usd' THEN round(1700::numeric / (SELECT "value"::numeric FROM "settings" WHERE "key" = 'dollar_rate'), 2)
    ELSE 1700
  END,
  "commission_percent" = 15;