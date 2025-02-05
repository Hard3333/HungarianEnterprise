import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertContactSchema, insertOrderSchema, insertDeliverySchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Add a health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ message: 'Failed to get products' });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const created = await storage.createProduct(product);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  });

  // New batch operations for products
  app.post("/api/products/import", async (req, res) => {
    try {
      const products = req.body.products;
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Products must be an array' });
      }

      // Validate each product using the schema
      const parsedProducts = products.map((product, index) => {
        try {
          return insertProductSchema.parse({
            name: product.name,
            sku: product.sku,
            price: product.price,
            stockLevel: product.stockLevel ?? 0,
            minStockLevel: product.minStockLevel ?? null,
            description: product.description ?? null,
            unit: product.unit ?? null
          });
        } catch (error) {
          throw new Error(`Invalid product at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      const created = await storage.createProducts(parsedProducts);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error importing products:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to import products' });
    }
  });

  app.delete("/api/products/batch", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid input: expected non-empty array of IDs' });
      }

      await storage.deleteProducts(ids);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting products:', error);
      res.status(500).json({ message: 'Failed to delete products' });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  app.patch("/api/products/batch", async (req, res) => {
    try {
      const { ids, updates } = req.body;
      if (!Array.isArray(ids) || !updates) {
        return res.status(400).json({ message: 'Invalid request format' });
      }

      const updated = await storage.updateProducts(ids, updates);
      res.json(updated);
    } catch (error) {
      console.error('Error updating products:', error);
      res.status(500).json({ message: 'Failed to update products' });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateProduct(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Failed to update product' });
    }
  });


  // Contact routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({ message: 'Failed to get contacts' });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = insertContactSchema.parse(req.body);
      const created = await storage.createContact(contact);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ message: 'Failed to create contact' });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateContact(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({ message: 'Failed to update contact' });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContact(id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ message: 'Failed to delete contact' });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ message: 'Failed to get orders' });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const created = await storage.createOrder(order);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateOrder(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: 'Failed to update order' });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrder(id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: 'Failed to delete order' });
    }
  });

  // Delivery routes
  app.get("/api/deliveries", async (req, res) => {
    try {
      const deliveries = await storage.getDeliveries();
      res.json(deliveries);
    } catch (error) {
      console.error('Error getting deliveries:', error);
      res.status(500).json({ message: 'Failed to get deliveries' });
    }
  });

  app.get("/api/deliveries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const delivery = await storage.getDelivery(id);
      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }
      res.json(delivery);
    } catch (error) {
      console.error('Error getting delivery:', error);
      res.status(500).json({ message: 'Failed to get delivery' });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const delivery = insertDeliverySchema.parse(req.body);
      const created = await storage.createDelivery(delivery);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating delivery:', error);
      res.status(500).json({ message: 'Failed to create delivery' });
    }
  });

  app.patch("/api/deliveries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateDelivery(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating delivery:', error);
      res.status(500).json({ message: 'Failed to update delivery' });
    }
  });

  app.delete("/api/deliveries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDelivery(id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting delivery:', error);
      res.status(500).json({ message: 'Failed to delete delivery' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}