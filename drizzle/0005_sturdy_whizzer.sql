ALTER TABLE "products" ADD COLUMN "code" varchar(60);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_code_unique" UNIQUE("code");