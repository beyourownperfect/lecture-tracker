import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  const atIdx = uri.indexOf("@");
  const hostPart = atIdx !== -1 ? uri.slice(atIdx + 1).split("?")[0] : "unknown";

  console.log("[DB] NODE_ENV:", process.env.NODE_ENV);
  console.log("[DB] URI length:", uri.length);
  console.log("[DB] Hosts:", hostPart);
  console.log("[DB] Starts with mongodb://:", uri.startsWith("mongodb://"));
  console.log("[DB] Contains authSource:", uri.includes("authSource=admin"));
  console.log("[DB] Contains ssl:", uri.includes("ssl=true"));

  if (uri.includes(" ")) {
    throw new Error("MONGODB_URI contains space characters — check Render environment variable for copy-paste artifacts");
  }

  const dbName = uri.split("/").pop()?.split("?")[0];
  if (!dbName || dbName.length === 0) {
    throw new Error("MONGODB_URI does not contain a database name — add /lecture-tracker after the host");
  }

  console.log("[DB] Database:", dbName);
  console.log("[DB] Connecting...");

  await mongoose.connect(uri);

  console.log("[DB] Connected successfully");
}
