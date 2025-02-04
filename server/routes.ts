import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertContactSchema, insertOrderSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const product = insertProductSchema.parse(req.body);
    const created = await storage.createProduct(product);
    res.status(201).json(created);
  });

  app.patch("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateProduct(id, req.body);
    res.json(updated);
  });

  app.delete("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.sendStatus(204);
  });

  // Contact routes
  app.get("/api/contacts", async (req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.post("/api/contacts", async (req, res) => {
    const contact = insertContactSchema.parse(req.body);
    const created = await storage.createContact(contact);
    res.status(201).json(created);
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateContact(id, req.body);
    res.json(updated);
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteContact(id);
    res.sendStatus(204);
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    const order = insertOrderSchema.parse(req.body);
    const created = await storage.createOrder(order);
    res.status(201).json(created);
  });

  app.patch("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateOrder(id, req.body);
    res.json(updated);
  });

  app.delete("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteOrder(id);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
