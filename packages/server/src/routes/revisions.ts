import { FastifyInstance } from "fastify";
import { Revision } from "../models/index.js";
import { createRevisionSchema, updateRevisionSchema } from "../schemas/revision.js";

const SPACED_INTERVALS = [3, 7, 14, 30]; // days between revisions

function nextScheduledDate(revisionNumber: number): Date {
  const days = SPACED_INTERVALS[revisionNumber] ?? 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function revisionRoutes(app: FastifyInstance) {
  app.get("/api/lectures/:lectureId/revisions", async (req, reply) => {
    const { lectureId } = req.params as { lectureId: string };
    const revisions = await Revision.find({ lectureId }).sort({ scheduledDate: 1 });
    return reply.send(revisions);
  });

  app.get("/api/revisions/dashboard", async (_req, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [overdue, dueToday, upcoming] = await Promise.all([
      Revision.find({ scheduledDate: { $lt: today }, completed: false })
        .populate({ path: "lectureId", select: "title topicId completed", populate: { path: "topicId", select: "name subjectId", populate: { path: "subjectId", select: "name" } } })
        .sort({ scheduledDate: 1 }),
      Revision.find({ scheduledDate: { $gte: today, $lt: tomorrow }, completed: false })
        .populate({ path: "lectureId", select: "title topicId completed", populate: { path: "topicId", select: "name subjectId", populate: { path: "subjectId", select: "name" } } })
        .sort({ scheduledDate: 1 }),
      Revision.find({ scheduledDate: { $gte: tomorrow, $lt: weekEnd }, completed: false })
        .populate({ path: "lectureId", select: "title topicId completed", populate: { path: "topicId", select: "name subjectId", populate: { path: "subjectId", select: "name" } } })
        .sort({ scheduledDate: 1 }),
    ]);

    return reply.send({ overdue, dueToday, upcoming });
  });

  app.post("/api/revisions", async (req, reply) => {
    const data = createRevisionSchema.parse(req.body);

    const existingCount = await Revision.countDocuments({
      lectureId: data.lectureId,
      type: data.type,
    });

    const revision = await Revision.create({
      ...data,
      revisionNumber: existingCount === 0 ? 1 : null,
    });

    return reply.status(201).send(revision);
  });

  app.put("/api/revisions/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const data = updateRevisionSchema.parse(req.body);

    const existing = await Revision.findById(id);
    if (!existing) return reply.status(404).send({ error: "Revision not found" });

    const revision = await Revision.findByIdAndUpdate(id, data, { new: true });
    if (!revision) return reply.status(404).send({ error: "Revision not found" });

    // If marking as completed and this is part of a numbered sequence, auto-schedule next
    if (data.completed && existing.revisionNumber != null) {
      const nextNumber = existing.revisionNumber + 1;
      if (nextNumber <= SPACED_INTERVALS.length) {
        await Revision.create({
          type: existing.type,
          lectureId: existing.lectureId,
          scheduledDate: nextScheduledDate(existing.revisionNumber),
          completed: false,
          revisionNumber: nextNumber,
        });
      }
    }

    return reply.send(revision);
  });

  app.delete("/api/revisions/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const revision = await Revision.findByIdAndDelete(id);
    if (!revision) return reply.status(404).send({ error: "Revision not found" });
    return reply.status(204).send();
  });
}
