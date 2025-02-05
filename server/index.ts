import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";

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
    const port = 5000;
    server.listen(port, '0.0.0.0', () => {
      log(`Server running at http://0.0.0.0:${port}`);
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