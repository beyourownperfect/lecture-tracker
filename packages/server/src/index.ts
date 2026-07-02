import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { connectDB } from "./lib/db.js";
import { registerErrorHandler } from "./lib/errors.js";
import { subjectRoutes } from "./routes/subjects.js";
import { topicRoutes } from "./routes/topics.js";
import { lectureRoutes } from "./routes/lectures.js";
import { revisionRoutes } from "./routes/revisions.js";
import { testRoutes } from "./routes/tests.js";

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

await app.register(helmet);
await app.register(cors, {
  origin: process.env.CLIENT_URL || "*",
});
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

registerErrorHandler(app);

await app.register(subjectRoutes);
await app.register(topicRoutes);
await app.register(lectureRoutes);
await app.register(revisionRoutes);
await app.register(testRoutes);

app.get("/health", async () => {
  return { status: "ok", uptime: process.uptime() };
});

try {
  await connectDB();
  await app.listen({ port, host });
} catch (err) {
  app.log.fatal(err, "Failed to start server");
  process.exit(1);
}

export { app };