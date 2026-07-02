import { FastifyInstance } from "fastify";
import { Topic } from "../models/index.js";
import { createTopicSchema, updateTopicSchema } from "../schemas/topic.js";

export async function topicRoutes(app: FastifyInstance) {
  app.get("/api/subjects/:subjectId/topics", async (req, reply) => {
    const { subjectId } = req.params as { subjectId: string };
    const topics = await Topic.find({ subjectId }).sort({ order: 1 });
    return reply.send(topics);
  });

  app.post("/api/topics", async (req, reply) => {
    const data = createTopicSchema.parse(req.body);
    const topic = await Topic.create(data);
    return reply.status(201).send(topic);
  });

  app.put("/api/topics/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const data = updateTopicSchema.parse(req.body);
    const topic = await Topic.findByIdAndUpdate(id, data, { new: true });
    if (!topic) return reply.status(404).send({ error: "Topic not found" });
    return reply.send(topic);
  });

  app.delete("/api/topics/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const topic = await Topic.findByIdAndDelete(id);
    if (!topic) return reply.status(404).send({ error: "Topic not found" });
    return reply.status(204).send();
  });
}
