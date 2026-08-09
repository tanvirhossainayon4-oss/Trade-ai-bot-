import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupDatabase } from "./server/db.js";
import marketRoutes from "./server/routes/markets.js";
import analysisRoutes from "./server/routes/analysis.js";
import { setupMarketWebSocket } from "./server/websocket.js";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  // Database setup
  await setupDatabase();

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());

  // API Routes
  app.use("/api/v1/markets", marketRoutes);
  app.use("/api/v1/analysis", analysisRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const httpServer = createServer(app);
  
  // Setup Socket.IO for live market data
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
  setupMarketWebSocket(io);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support React Router
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
