import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import mongoose from "mongoose";
import { seedSubjects } from "./seed.js";
import { registerErrorHandler } from "./lib/errors.js";
import { subjectRoutes } from "./routes/subjects.js";
import { topicRoutes } from "./routes/topics.js";
import { lectureRoutes } from "./routes/lectures.js";
import { revisionRoutes } from "./routes/revisions.js";
import { testRoutes } from "./routes/tests.js";
import { weeklyReportRoutes } from "./routes/reports.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = parseInt(process.env.PORT || "3001");
const host = process.env.HOST || "0.0.0.0";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport: process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  },
});

await app.register(helmet, {
  contentSecurityPolicy: false,
});

await app.register(cors, {
  origin: process.env.CLIENT_URL || "*",
});
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Serve built frontend assets
const distPath = path.resolve(__dirname, "../../web/dist");
await app.register(fastifyStatic, {
  root: distPath,
  prefix: "/",
  wildcard: false,
});

// API routes
registerErrorHandler(app);
await app.register(subjectRoutes);
await app.register(topicRoutes);
await app.register(lectureRoutes);
await app.register(revisionRoutes);
await app.register(testRoutes);
await app.register(weeklyReportRoutes);

app.get("/health", async () => {
  return { status: "ok", uptime: process.uptime() };
});

// SPA fallback - serve index.html for all non-API routes
app.setNotFoundHandler(async (request, reply) => {
  if (request.url.startsWith("/api")) {
    return reply.status(404).send({ error: "Not found" });
  }
  return reply.sendFile("index.html");
});

try {
  await connectDB();
  const connState = mongoose.connection.readyState;
  console.log(`[DB] Connection state: ${connState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
  if (connState !== 1) {
    throw new Error(`MongoDB not connected (state: ${connState})`);
  }
  await seedSubjects();
  await app.listen({ port, host });
} catch (err) {
  app.log.fatal(err, "Failed to start server");
  process.exit(1);
}

export { app };