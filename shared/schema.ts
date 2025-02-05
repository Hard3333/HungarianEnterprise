import { pgTable, text, serial, integer, timestamp, numeric, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// VAT rates table for Hungarian ÁFA
export const vatRates = pgTable("vat_rates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rate: numeric("rate").notNull(),
  description: text("description"),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to"),
});

// Products table with VAT info
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  price: numeric("price").notNull(),
  vatRateId: integer("vat_rate_id").notNull(),
  stockLevel: integer("stock_level").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(0),
  unit: text("unit").default("db"),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  taxNumber: text("tax_number"),
  notes: text("notes"),
  totalOrders: integer("total_orders").default(0),
  totalSpent: numeric("total_spent").default("0"),
  lastOrderDate: timestamp("last_order_date"),
  rating: numeric("rating"),
});

// Orders table with VAT details
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  status: text("status").notNull(),
  netTotal: numeric("net_total").notNull(),
  vatTotal: numeric("vat_total").notNull(),
  grossTotal: numeric("gross_total").notNull(),
  items: jsonb("items").notNull(),
  invoiceNumber: text("invoice_number"),
  notes: text("notes"),
});

// VAT transactions table for reporting
export const vatTransactions = pgTable("vat_transactions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  vatRateId: integer("vat_rate_id").notNull(),
  netAmount: numeric("net_amount").notNull(),
  vatAmount: numeric("vat_amount").notNull(),
  reportingPeriod: text("reporting_period").notNull(),
  reported: boolean("reported").default(false),
});

// Schema validations
export const insertUserSchema = createInsertSchema(users);
export const insertVatRateSchema = createInsertSchema(vatRates);

export const insertProductSchema = createInsertSchema(products, {
  price: z.number().or(z.string()).transform(val => String(val)),
  vatRateId: z.number(),
});

export const insertContactSchema = createInsertSchema(contacts, {
  totalSpent: z.number().or(z.string()).transform(val => String(val)).optional(),
  rating: z.number().or(z.string()).transform(val => String(val)).optional(),
});

export const insertOrderSchema = createInsertSchema(orders, {
  netTotal: z.number().or(z.string()).transform(val => String(val)),
  vatTotal: z.number().or(z.string()).transform(val => String(val)),
  grossTotal: z.number().or(z.string()).transform(val => String(val)),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.string(),
    vatRate: z.string(),
    vatAmount: z.string(),
  })),
});

export const insertVatTransactionSchema = createInsertSchema(vatTransactions, {
  netAmount: z.number().or(z.string()).transform(val => String(val)),
  vatAmount: z.number().or(z.string()).transform(val => String(val)),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type VatRate = typeof vatRates.$inferSelect;
export type InsertVatRate = z.infer<typeof insertVatRateSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = {
  productId: number;
  quantity: number;
  price: string;
  vatRate: string;
  vatAmount: string;
};

export type VatTransaction = typeof vatTransactions.$inferSelect;
export type InsertVatTransaction = z.infer<typeof insertVatTransactionSchema>;

// Translation keys for forms and tables
export const translationKeys = {
  contact: "contact",
  selectContact: "selectContact",
  status: "status",
  selectStatus: "selectStatus",
  netTotal: "netTotal",
  vatTotal: "vatTotal",
  grossTotal: "grossTotal",
  invoiceNumber: "invoiceNumber",
  save: "save",
  create: "create",
  pending: "pending",
  completed: "completed",
  cancelled: "cancelled",
  reported: "reported",
} as const;

export type TranslationKey = keyof typeof translationKeys;