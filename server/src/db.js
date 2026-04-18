import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { config } from "./config.js";

let memoryServer;

export async function connectDb() {
  if (config.useInMemoryDb) {
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri(), {
      dbName: "event_management"
    });
    return;
  }

  await mongoose.connect(config.mongoUri);
}

export async function disconnectDb() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}
