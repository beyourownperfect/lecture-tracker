import { FastifyInstance } from "fastify";
import { SubjectTest, TopicTest, FullMockTest } from "../models/index.js";
import { createTestSchema, updateTestSchema } from "../schemas/test.js";

export async function testRoutes(app: FastifyInstance) {
  app.get("/api/tests/dashboard", async (_req, reply) => {
    const [subjectTests, topicTests, mockTests] = await Promise.all([
      SubjectTest.find()
        .populate({ path: "subjectId", select: "name" })
        .sort({ date: -1 }),
      TopicTest.find()
        .populate({ path: "topicId", select: "name subjectId", populate: { path: "subjectId", select: "name" } })
        .sort({ date: -1 }),
      FullMockTest.find().sort({ date: -1 }),
    ]);

    return reply.send({ subjectTests, topicTests, mockTests });
  });

  app.get("/api/subjects/:subjectId/tests", async (req, reply) => {
    const { subjectId } = req.params as { subjectId: string };
    const tests = await SubjectTest.find({ subjectId }).sort({ date: -1 });
    return reply.send(tests);
  });

  app.post("/api/subject-tests", async (req, reply) => {
    const { subjectId } = req.body as { subjectId: string };
    const data = createTestSchema.parse(req.body);
    const test = await SubjectTest.create({ ...data, subjectId });
    return reply.status(201).send(test);
  });

  app.put("/api/subject-tests/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const data = updateTestSchema.parse(req.body);
    const test = await SubjectTest.findByIdAndUpdate(id, data, { new: true });
    if (!test) return reply.status(404).send({ error: "Test not found" });
    return reply.send(test);
  });

  app.delete("/api/subject-tests/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const test = await SubjectTest.findByIdAndDelete(id);
    if (!test) return reply.status(404).send({ error: "Test not found" });
    return reply.status(204).send();
  });

  app.get("/api/topics/:topicId/tests", async (req, reply) => {
    const { topicId } = req.params as { topicId: string };
    const tests = await TopicTest.find({ topicId }).sort({ date: -1 });
    return reply.send(tests);
  });

  app.post("/api/topic-tests", async (req, reply) => {
    const { topicId } = req.body as { topicId: string };
    const data = createTestSchema.parse(req.body);
    const test = await TopicTest.create({ ...data, topicId });
    return reply.status(201).send(test);
  });

  app.put("/api/topic-tests/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const data = updateTestSchema.parse(req.body);
    const test = await TopicTest.findByIdAndUpdate(id, data, { new: true });
    if (!test) return reply.status(404).send({ error: "Test not found" });
    return reply.send(test);
  });

  app.delete("/api/topic-tests/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const test = await TopicTest.findByIdAndDelete(id);
    if (!test) return reply.status(404).send({ error: "Test not found" });
    return reply.status(204).send();
  });

  app.get("/api/mock-tests", async (_req, reply) => {
    const tests = await FullMockTest.find().sort({ date: -1 });
    return reply.send(tests);
  });

  app.post("/api/mock-tests", async (req, reply) => {
    const data = createTestSchema.parse(req.body);
    const test = await FullMockTest.create(data);
    return reply.status(201).send(test);
  });

  app.put("/api/mock-tests/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const data = updateTestSchema.parse(req.body);
    const test = await FullMockTest.findByIdAndUpdate(id, data, { new: true });
    if (!test) return reply.status(404).send({ error: "Test not found" });
    return reply.send(test);
  });

  app.delete("/api/mock-tests/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const test = await FullMockTest.findByIdAndDelete(id);
    if (!test) return reply.status(404).send({ error: "Test not found" });
    return reply.status(204).send();
  });
}
