import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Ensure required environment variables are set
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}

async function startServer() {
  try {
    const app = express();

    // Basic middleware
    app.use(cors());
    app.use(express.json());

    // Simple logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        if (req.path.startsWith("/api")) {
          log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
        }
      });
      next();
    });

    // Create HTTP server first
    const server = registerRoutes(app);

    // Development vs Production setup
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);
    } else {
      // In development, setup Vite
      try {
        await setupVite(app, server);
      } catch (error) {
        console.error('Vite setup failed:', error);
        // Continue anyway as API might still work
      }
    }

    // Start listening
    const port = process.env.PORT || 5000;
    server.listen(port, '0.0.0.0', () => {
      log(`Server running at http://0.0.0.0:${port}`);
      log(`Environment: ${process.env.NODE_ENV}`);
      log(`Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]{1,}@/, ':***@')}`);
    });

    return server;
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

// Start server and handle any unhandled rejections
startServer().catch((error) => {
  console.error('Unhandled server error:', error);
  process.exit(1);
});