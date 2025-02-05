import { Contact, InsertContact, InsertOrder, InsertProduct, Order, Product, User, InsertUser, Delivery, InsertDelivery } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { users, products, contacts, orders, deliveries } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  createProducts(products: InsertProduct[]): Promise<Product[]>;
  deleteProducts(ids: number[]): Promise<void>;
  updateProducts(ids: number[], updates: Partial<Product>): Promise<Product[]>;

  // Contact operations
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<Contact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;

  // Delivery operations
  getDeliveries(): Promise<Delivery[]>;
  getDelivery(id: number): Promise<Delivery | undefined>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: number, delivery: Partial<Delivery>): Promise<Delivery>;
  deleteDelivery(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session',
      schemaName: 'public',
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (!user) {
        console.log(`No user found with id: ${id}`);
      }
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      if (!user) {
        console.log(`No user found with username: ${username}`);
      }
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await db.insert(users).values(user).returning();
      console.log('Created new user:', newUser.id);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async createProducts(productList: InsertProduct[]): Promise<Product[]> {
    try {
      // Explicitly use the products table and properly format the values
      const valuesToInsert = productList.map(product => ({
        name: product.name,
        sku: product.sku,
        price: product.price,
        stockLevel: product.stockLevel ?? 0,
        minStockLevel: product.minStockLevel ?? null,
        description: product.description ?? null,
        unit: product.unit ?? null
      }));

      const createdProducts = await db
        .insert(products)
        .values(valuesToInsert)
        .returning({
          id: products.id,
          name: products.name,
          sku: products.sku,
          price: products.price,
          stockLevel: products.stockLevel,
          minStockLevel: products.minStockLevel,
          description: products.description,
          unit: products.unit
        });

      return createdProducts;
    } catch (error) {
      console.error('Error creating products in batch:', error);
      throw new Error(`Failed to create products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteProducts(ids: number[]): Promise<void> {
    try {
      await db.delete(products).where(sql`${products.id} = ANY(${ids})`);
    } catch (error) {
      console.error('Error deleting products in batch:', error);
      throw error;
    }
  }

  async updateProducts(ids: number[], updates: Partial<Product>): Promise<Product[]> {
    try {
      const updatedProducts = await db
        .update(products)
        .set(updates)
        .where(sql`${products.id} = ANY(${ids})`)
        .returning();
      return updatedProducts;
    } catch (error) {
      console.error('Error updating products in batch:', error);
      throw error;
    }
  }

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async updateContact(id: number, contact: Partial<Contact>): Promise<Contact> {
    const [updated] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updated;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set(order)
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  // Delivery operations
  async getDeliveries(): Promise<Delivery[]> {
    try {
      const result = await db.select().from(deliveries);
      return result;
    } catch (error) {
      console.error('Error getting deliveries:', error);
      throw error;
    }
  }

  async getDelivery(id: number): Promise<Delivery | undefined> {
    try {
      const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
      if (!delivery) {
        console.log(`No delivery found with id: ${id}`);
      }
      return delivery;
    } catch (error) {
      console.error('Error getting delivery:', error);
      return undefined;
    }
  }

  async createDelivery(delivery: InsertDelivery): Promise<Delivery> {
    try {
      const [newDelivery] = await db.insert(deliveries).values(delivery).returning();
      console.log('Created new delivery:', newDelivery.id);
      return newDelivery;
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw error;
    }
  }

  async updateDelivery(id: number, delivery: Partial<Delivery>): Promise<Delivery> {
    try {
      const [updated] = await db
        .update(deliveries)
        .set(delivery)
        .where(eq(deliveries.id, id))
        .returning();
      if (!updated) {
        throw new Error(`No delivery found with id: ${id}`);
      }
      return updated;
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw error;
    }
  }

  async deleteDelivery(id: number): Promise<void> {
    try {
      await db.delete(deliveries).where(eq(deliveries.id, id));
    } catch (error) {
      console.error('Error deleting delivery:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();