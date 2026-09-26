-- Asigna un código numérico secuencial (0001, 0002, ...) a todos los
-- productos que todavía no tienen código, en el orden en que se cargaron.
-- Si algún producto ya tiene un código manual, se respeta y no se pisa.
WITH existing_codes AS (
  SELECT code FROM products WHERE code IS NOT NULL
),
to_assign AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC) AS rn
  FROM products
  WHERE code IS NULL
),
candidates AS (
  SELECT n, lpad(n::text, 4, '0') AS code_str
  FROM generate_series(1, (SELECT count(*) FROM to_assign) + (SELECT count(*) FROM existing_codes)) AS n
),
free_candidates AS (
  SELECT code_str, row_number() OVER (ORDER BY n) AS rn
  FROM candidates
  WHERE code_str NOT IN (SELECT code FROM existing_codes)
)
UPDATE products p
SET code = fc.code_str
FROM to_assign ta
JOIN free_candidates fc ON fc.rn = ta.rn
WHERE p.id = ta.id;
--> statement-breakpoint
-- Inicializa (o ajusta) el contador de códigos automáticos para que la
-- próxima carga continúe después del código numérico más alto ya usado.
INSERT INTO settings (key, value, updated_at)
VALUES (
  'product_code_seq',
  (SELECT COALESCE(MAX(CASE WHEN code ~ '^\d+$' THEN code::int ELSE 0 END), 0)::text FROM products),
  now()
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;
