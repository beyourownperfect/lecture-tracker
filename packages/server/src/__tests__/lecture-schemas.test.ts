import { describe, it, expect } from "vitest";
import { createLectureSchema, updateLectureSchema } from "../schemas/lecture";

describe("Lecture Schemas", () => {
  describe("createLectureSchema", () => {
    it("accepts valid lecture data", () => {
      const result = createLectureSchema.safeParse({
        title: "Introduction",
        topicId: "507f1f77bcf86cd799439011",
        duration: 45,
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing title", () => {
      const result = createLectureSchema.safeParse({
        topicId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing topicId", () => {
      const result = createLectureSchema.safeParse({
        title: "Lecture",
      });
      expect(result.success).toBe(false);
    });

    it("defaults duration to 0", () => {
      const result = createLectureSchema.safeParse({
        title: "No Duration",
        topicId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.duration).toBe(0);
      }
    });

    it("rejects negative duration", () => {
      const result = createLectureSchema.safeParse({
        title: "Bad",
        topicId: "507f1f77bcf86cd799439011",
        duration: -5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateLectureSchema", () => {
    it("allows partial updates", () => {
      const result = updateLectureSchema.safeParse({ title: "Updated Title" });
      expect(result.success).toBe(true);
    });

    it("accepts completed with completedAt", () => {
      const result = updateLectureSchema.safeParse({
        completed: true,
        completedAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });
  });
});
