import { FastifyInstance } from "fastify";
import { Subject, Topic, Lecture, Revision, SubjectTest, TopicTest, FullMockTest } from "../models/index.js";

export async function weeklyReportRoutes(app: FastifyInstance) {
  app.get("/api/reports/weekly", async (_req, reply) => {
    const subjects = await Subject.find().sort({ order: 1 });
    const subjectIds = subjects.map((s) => s._id);
    const topics = await Topic.find({ subjectId: { $in: subjectIds } }).sort({ order: 1 });
    const topicIds = topics.map((t) => t._id);
    const lectures = await Lecture.find({ topicId: { $in: topicIds } }).sort({ order: 1 });

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const completedLecturesThisWeek = await Lecture.find({
      completed: true,
      completedAt: { $gte: weekStart.toISOString(), $lte: now.toISOString() },
    }).sort({ completedAt: 1 });

    const allRevisions = await Revision.find({
      lectureId: { $in: lectures.map((l) => l._id) },
      scheduledDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    }).sort({ scheduledDate: 1 });

    const subjectTests = await SubjectTest.find({ subjectId: { $in: subjectIds } });
    const topicTests = await TopicTest.find({ topicId: { $in: topicIds } });
    const mockTests = await FullMockTest.find();

    const testsThisWeek = [
      ...subjectTests,
      ...topicTests,
      ...mockTests,
    ].filter((t) => {
      const d = new Date(t.date);
      return d >= weekStart && d <= now;
    }).length;

    return reply.send({
      subjects,
      topics,
      lectures,
      completedLecturesThisWeek,
      allRevisions,
      subjectTests,
      topicTests,
      mockTests,
      testsThisWeek,
    });
  });
}
