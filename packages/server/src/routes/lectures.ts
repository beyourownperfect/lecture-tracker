import { FastifyInstance } from "fastify";
import { Lecture, Revision } from "../models/index.js";
import { createLectureSchema, updateLectureSchema } from "../schemas/lecture.js";

export async function lectureRoutes(app: FastifyInstance) {
  app.get("/api/topics/:topicId/lectures", async (req, reply) => {
    const { topicId } = req.params as { topicId: string };
    const lectures = await Lecture.find({ topicId }).sort({ order: 1 });
    const lectureIds = lectures.map((l) => l._id);
    const revisions = await Revision.find({ lectureId: { $in: lectureIds } }).sort({ scheduledDate: 1 });

    const revisionMap = new Map<string, typeof revisions>();
    for (const r of revisions) {
      const lid = r.lectureId.toString();
      if (!revisionMap.has(lid)) revisionMap.set(lid, []);
      revisionMap.get(lid)!.push(r);
    }

    const result = lectures.map((l) => {
      const json = l.toJSON() as Record<string, unknown>;
      json.revisions = revisionMap.get(l._id.toString()) || [];
      return json;
    });

    return reply.send(result);
  });

  app.post("/api/lectures", async (req, reply) => {
    const data = createLectureSchema.parse(req.body);
    const lecture = await Lecture.create(data);
    return reply.status(201).send(lecture);
  });

  app.put("/api/lectures/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const data = updateLectureSchema.parse(req.body);

    if (data.completed && !data.completedAt) {
      data.completedAt = new Date().toISOString();
    }
    if (data.completed === false) {
      data.completedAt = null;
    }

    const lecture = await Lecture.findByIdAndUpdate(id, data, { new: true });
    if (!lecture) return reply.status(404).send({ error: "Lecture not found" });
    return reply.send(lecture);
  });

  app.delete("/api/lectures/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const lecture = await Lecture.findByIdAndDelete(id);
    if (!lecture) return reply.status(404).send({ error: "Lecture not found" });
    return reply.status(204).send();
  });
}
