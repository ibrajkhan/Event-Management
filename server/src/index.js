import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDb } from "./db.js";
import { config } from "./config.js";

async function start() {
  await connectDb();
  const app = createApp();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.clientUrl
    }
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
