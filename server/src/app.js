import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import attendeeRoutes from "./routes/attendeeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";
import { config } from "./config.js";
import { requireAuth } from "./middleware/authMiddleware.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        const normalizedOrigin = origin?.replace(/\/+$/, "");

        if (!origin || config.clientOrigins.includes(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
    }),
  );
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api", requireAuth);
  app.use("/api/attendees", attendeeRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/scan", scanRoutes);

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  });

  return app;
}
