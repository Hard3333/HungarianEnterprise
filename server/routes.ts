import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertContactSchema, insertOrderSchema } from "@shared/schema";
import { insertVatTransactionSchema } from "@shared/schema";

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

  app.post("/api/products/import", async (req, res) => {
    try {
      const products = req.body.products;
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Products must be an array' });
      }

      const parsedProducts = products.map((product, index) => {
        try {
          return insertProductSchema.parse(product);
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
      await createVatTransactionForOrder(created);
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
      await createVatTransactionForOrder(updated);
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

  // VAT Transaction routes
  app.get("/api/vat-transactions", async (req, res) => {
    try {
      const transactions = await storage.getVatTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Error getting VAT transactions:', error);
      res.status(500).json({ message: 'Failed to get VAT transactions' });
    }
  });

  app.post("/api/vat-transactions", async (req, res) => {
    try {
      const transaction = insertVatTransactionSchema.parse(req.body);
      const created = await storage.createVatTransaction(transaction);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating VAT transaction:', error);
      res.status(500).json({ message: 'Failed to create VAT transaction' });
    }
  });

  app.patch("/api/vat-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateVatTransaction(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating VAT transaction:', error);
      res.status(500).json({ message: 'Failed to update VAT transaction' });
    }
  });

  // Add VAT transaction creation on order creation/update
  const createVatTransactionForOrder = async (order: any) => {
    try {
      const reportingPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

      // Create VAT transaction for each item in the order
      const vatTransactionsPromises = order.items.map(async (item: any) => {
        return storage.createVatTransaction({
          orderId: order.id,
          transactionDate: new Date(),
          vatRateId: item.vatRateId,
          netAmount: String(Number(item.price) * item.quantity),
          vatAmount: String(Number(item.vatAmount) * item.quantity),
          reportingPeriod,
          reported: false,
        });
      });

      await Promise.all(vatTransactionsPromises);
    } catch (error) {
      console.error('Error creating VAT transactions for order:', error);
      throw error;
    }
  };


  const httpServer = createServer(app);
  return httpServer;
}