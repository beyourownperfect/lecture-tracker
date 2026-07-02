import { FastifyInstance } from "fastify";
import { Subject, Topic, Lecture } from "../models/index.js";

export async function subjectRoutes(app: FastifyInstance) {
  app.get("/api/subjects", async (_req, reply) => {
    const subjects = await Subject.find().sort({ order: 1 });

    const subjectIds = subjects.map((s) => s._id);
    const topics = await Topic.find({ subjectId: { $in: subjectIds } });
    const topicIds = topics.map((t) => t._id);
    const lectures = await Lecture.find({ topicId: { $in: topicIds } });

    const topicMap = new Map<string, string[]>();
    for (const t of topics) {
      const sid = t.subjectId.toString();
      if (!topicMap.has(sid)) topicMap.set(sid, []);
      topicMap.get(sid)!.push(t._id.toString());
    }

    const lectureCount = new Map<string, number>();
    const completedCount = new Map<string, number>();
    const durationTotal = new Map<string, number>();
    const durationCompleted = new Map<string, number>();
    for (const l of lectures) {
      const tid = l.topicId.toString();
      lectureCount.set(tid, (lectureCount.get(tid) || 0) + 1);
      durationTotal.set(tid, (durationTotal.get(tid) || 0) + (l.duration || 0));
      if (l.completed) {
        completedCount.set(tid, (completedCount.get(tid) || 0) + 1);
        durationCompleted.set(tid, (durationCompleted.get(tid) || 0) + (l.duration || 0));
      }
    }

    const result = subjects.map((s) => {
      const sid = s._id.toString();
      const tids = topicMap.get(sid) || [];
      let totalLectures = 0;
      let completedLectures = 0;
      let totalDuration = 0;
      let completedDuration = 0;
      for (const tid of tids) {
        totalLectures += lectureCount.get(tid) || 0;
        completedLectures += completedCount.get(tid) || 0;
        totalDuration += durationTotal.get(tid) || 0;
        completedDuration += durationCompleted.get(tid) || 0;
      }
      const json = s.toJSON() as Record<string, unknown>;
      json.totalLectures = totalLectures;
      json.completedLectures = completedLectures;
      json.totalDuration = totalDuration;
      json.completedDuration = completedDuration;
      return json;
    });

    return reply.send(result);
  });
}
