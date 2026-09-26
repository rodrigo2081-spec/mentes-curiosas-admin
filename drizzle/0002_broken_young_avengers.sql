CREATE TYPE "public"."currency" AS ENUM('ars', 'usd');--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cost_currency" "currency" DEFAULT 'ars' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "commission_percent" numeric(5, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
-- Los productos ya cargados antes de este cambio se ingresaron todos en
-- dólares: los marcamos como tales para que el costo se convierta a pesos
-- con la cotización vigente. Los productos nuevos van a elegir su moneda
-- explícitamente en el formulario (por defecto pesos).
UPDATE "products" SET "cost_currency" = 'usd';--> statement-breakpoint
-- Cotización inicial del dólar ($1550), editable luego desde
-- Administración sin necesidad de redeploy.
INSERT INTO "settings" ("key", "value") VALUES ('dollar_rate', '1550') ON CONFLICT ("key") DO NOTHING;