import mongoose from "mongoose";

let isMongoConnected = false;

export async function connectMongo() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set. Add it in express-server/.env");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  isMongoConnected = true;

  mongoose.connection.on("disconnected", () => {
    isMongoConnected = false;
  });

  mongoose.connection.on("connected", () => {
    isMongoConnected = true;
  });
}

export function getMongoStatus() {
  return isMongoConnected ? "connected" : "disconnected";
}
