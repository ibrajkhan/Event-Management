import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDb } from "./db.js";
import { config } from "./config.js";
import { verifyAuthToken } from "./services/authService.js";

async function start() {
  await connectDb();
  const app = createApp();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin(origin, callback) {
        const normalizedOrigin = origin?.replace(/\/+$/, "");

        if (!origin || config.clientOrigins.includes(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS.`));
      }
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const payload = verifyAuthToken(token);

    if (!payload) {
      next(new Error("Authentication required."));
      return;
    }

    socket.user = payload;
    next();
  });

  app.set("io", io);

  server.listen(config.port, () => {
    console.log(`API running on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
