import mongoose from "mongoose";

export async function connectDB() {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const uri = rawUri.replace(/\s+/g, "");

  const atIdx = uri.indexOf("@");
  const hostPart = atIdx !== -1 ? uri.slice(atIdx + 1).split("?")[0] : "unknown";

  console.log("[DB] NODE_ENV:", process.env.NODE_ENV);
  console.log("[DB] URI length:", uri.length);
  console.log("[DB] Hosts:", hostPart);
  console.log("[DB] Sanitized whitespace:", rawUri.length !== uri.length);

  if (uri.includes(" ")) {
    throw new Error("MONGODB_URI still contains space characters after sanitization");
  }

  const dbName = uri.split("/").pop()?.split("?")[0];
  if (!dbName || dbName.length === 0) {
    throw new Error("MONGODB_URI missing database name");
  }

  console.log("[DB] Database:", dbName);
  console.log("[DB] Connecting...");

  await mongoose.connect(uri);

  console.log("[DB] Connected successfully");
}
