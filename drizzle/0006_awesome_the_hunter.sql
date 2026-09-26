ALTER TABLE "categories" ADD COLUMN "manual_price_list" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- Crea la categoría "Libro": sus productos cargan el Precio de Lista a mano
-- en vez del x2 automático sobre el costo total.
INSERT INTO "categories" ("name", "slug", "manual_price_list")
VALUES ('Libro', 'libro', true)
ON CONFLICT ("slug") DO UPDATE SET "manual_price_list" = true;--> statement-breakpoint
-- Aplica el nuevo criterio a los productos ya cargados: Precio de Lista =
-- 100% de margen sobre el costo total (x2), salvo los de una categoría
-- marcada como "precio manual" (por ahora, ninguno cae ahí).
UPDATE "products" AS p
SET "price" = round(
  (p."cost_product" + p."cost_shipping" + p."cost_additional") * (1 + p."commission_percent" / 100) * 2,
  2
)
WHERE p."category_id" IS NULL
   OR NOT EXISTS (
     SELECT 1 FROM "categories" c WHERE c."id" = p."category_id" AND c."manual_price_list" = true
   );