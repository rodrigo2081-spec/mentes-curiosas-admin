-- Custom SQL migration file, put your code below! --

-- Corrección: la moneda (pesos/dólares) aplica únicamente al costo de la
-- mercadería. El flete y el costo adicional siempre son en pesos, así que
-- se corrige el flete de los 30 productos (la migración anterior lo había
-- convertido a dólares por error para los que tenían cost_currency = 'usd').
UPDATE "products" SET "cost_shipping" = 1700;

-- Convierte a pesos, de una vez y para siempre, el costo de mercadería de
-- los productos que estaban en dólares (con la cotización vigente), y los
-- marca como pesos: si la cotización cambia después, estos productos ya
-- convertidos no se vuelven a mover.
UPDATE "products"
SET
  "cost_product" = round("cost_product" * (SELECT "value"::numeric FROM "settings" WHERE "key" = 'dollar_rate'), 2),
  "cost_currency" = 'ars'
WHERE "cost_currency" = 'usd';