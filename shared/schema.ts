import { pgTable, text, serial, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  price: text("price").notNull(),
  stockLevel: integer("stock_level").notNull().default(0),
  minStockLevel: integer("min_stock_level").default(0),
  unit: text("unit").default("db"),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // customer or supplier
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  taxNumber: text("tax_number"),
  notes: text("notes"),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  status: text("status").notNull(), // pending, completed, cancelled
  total: text("total").notNull(),
  items: jsonb("items").notNull(), // Array of {productId, quantity, price}
  invoiceNumber: text("invoice_number"),
  notes: text("notes"),
});

// Schema validations with proper type transformations
export const insertUserSchema = createInsertSchema(users);

export const insertProductSchema = createInsertSchema(products, {
  price: z.string().or(z.number()).transform(val => String(val)),
});

export const insertContactSchema = createInsertSchema(contacts);

export const insertOrderSchema = createInsertSchema(orders, {
  total: z.string().or(z.number()).transform(val => String(val)),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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
};