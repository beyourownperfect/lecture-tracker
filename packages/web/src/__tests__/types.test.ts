import { describe, it, expect } from "vitest";
import type { Subject, Topic, Lecture, Revision } from "../types";

describe("Type contracts", () => {
  it("subject has required fields", () => {
    const s: Subject = {
      id: "1",
      name: "C Programming",
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(s.id).toBe("1");
    expect(s.name).toBe("C Programming");
    expect(s.completedLectures).toBeUndefined();
  });

  it("topic has pyq fields", () => {
    const t: Topic = {
      id: "2",
      name: "Pointers",
      order: 0,
      subjectId: "1",
      totalPyqs: 0,
      solvedPyqs: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(t.totalPyqs).toBe(0);
    expect(t.solvedPyqs).toBe(0);
  });

  it("lecture includes revisions", () => {
    const l: Lecture = {
      id: "3",
      title: "Intro",
      duration: 30,
      completed: false,
      completedAt: null,
      order: 0,
      topicId: "2",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisions: [],
    };
    expect(l.revisions).toEqual([]);
  });

  it("revision supports revisionNumber", () => {
    const r: Revision = {
      id: "4",
      type: "NOTES",
      scheduledDate: new Date().toISOString(),
      completed: false,
      revisionNumber: 1,
      lectureId: "3",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(r.revisionNumber).toBe(1);
  });
});
