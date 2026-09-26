import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

// Método de pago elegido en una venta. Cada uno mapea a una caja fija:
// efectivo -> Efectivo, transferencia_flor / tarjeta -> Banco Flor, transferencia_rodrigo -> Banco Rodrigo.
export const paymentMethodEnum = pgEnum("payment_method", [
  "efectivo",
  "transferencia_flor",
  "transferencia_rodrigo",
  "tarjeta",
]);

// Las tres cajas del negocio.
export const cashBoxEnum = pgEnum("cash_box", ["efectivo", "banco_flor", "banco_rodrigo"]);

// Moneda en la que se cargan los costos de un producto (costo del producto,
// flete, costo adicional). El precio de venta siempre es en pesos.
export const currencyEnum = pgEnum("currency", ["ars", "usd"]);

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  description: text("description").default("").notNull(),
  // Costos que arman el costo total del producto. Se cargan en `costCurrency`
  // (pesos o dólares); el precio de venta siempre es en pesos.
  costProduct: numeric("cost_product", { precision: 12, scale: 2 }).notNull().default("0"),
  costShipping: numeric("cost_shipping", { precision: 12, scale: 2 }).notNull().default("0"),
  costAdditional: numeric("cost_additional", { precision: 12, scale: 2 }).notNull().default("0"),
  costCurrency: currencyEnum("cost_currency").notNull().default("ars"),
  // Comisión adicional (%) que se paga por la compra de la mercadería. Se
  // suma como porcentaje sobre el costo (ya convertido a pesos).
  commissionPercent: numeric("commission_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  // Precio de venta "de lista". El precio de contado (5% off) se calcula a partir de este.
  // Nota: la columna en la base sigue llamándose "price" (columna original) para que la
  // migración sea un ALTER simple en vez de un rename ambiguo.
  priceList: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  stock: integer("stock").notNull().default(0),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  // Controls whether the product is visible in the future online store.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productMedia = pgTable("product_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: mediaTypeEnum("type").notNull(),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 60 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerAddress: text("customer_address"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  // Derivada automáticamente del método de pago al crear la venta.
  cashBox: cashBoxEnum("cash_box").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  note: text("note"),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const saleItems = pgTable("sale_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  // Se guarda una copia del nombre por si el producto se edita o borra después.
  productName: varchar("product_name", { length: 200 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  // Precio y costo unitarios aplicados en el momento de la venta (foto histórica).
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull().default("0"),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: varchar("description", { length: 255 }).notNull(),
  category: varchar("category", { length: 120 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  cashBox: cashBoxEnum("cash_box").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profitWithdrawals = pgTable("profit_withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  partner: varchar("partner", { length: 120 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  cashBox: cashBoxEnum("cash_box").notNull(),
  note: text("note"),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Configuración general del sistema (clave/valor). Por ahora se usa para la
// cotización del dólar (clave "dollar_rate"), usada para convertir a pesos
// los costos de productos cargados en dólares.
export const settings = pgTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cashTransfers = pgTable("cash_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromCashBox: cashBoxEnum("from_cash_box").notNull(),
  toCashBox: cashBoxEnum("to_cash_box").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  note: text("note"),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  media: many(productMedia),
  saleItems: many(saleItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ many }) => ({
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));
