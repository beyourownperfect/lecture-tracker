import { describe, it, expect } from "vitest";
import { createRevisionSchema, updateRevisionSchema } from "../schemas/revision";

describe("Revision Schemas", () => {
  describe("createRevisionSchema", () => {
    it("accepts valid NOTES revision", () => {
      const result = createRevisionSchema.safeParse({
        type: "NOTES",
        scheduledDate: new Date().toISOString(),
        lectureId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid FLASHCARDS revision", () => {
      const result = createRevisionSchema.safeParse({
        type: "FLASHCARDS",
        scheduledDate: new Date().toISOString(),
        lectureId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid type", () => {
      const result = createRevisionSchema.safeParse({
        type: "INVALID",
        scheduledDate: new Date().toISOString(),
        lectureId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing lectureId", () => {
      const result = createRevisionSchema.safeParse({
        type: "NOTES",
        scheduledDate: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });

    it("defaults completed to false", () => {
      const result = createRevisionSchema.safeParse({
        type: "NOTES",
        scheduledDate: new Date().toISOString(),
        lectureId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completed).toBe(false);
      }
    });
  });

  describe("updateRevisionSchema", () => {
    it("allows partial updates", () => {
      const result = updateRevisionSchema.safeParse({ completed: true });
      expect(result.success).toBe(true);
    });

    it("accepts type change", () => {
      const result = updateRevisionSchema.safeParse({ type: "FLASHCARDS" });
      expect(result.success).toBe(true);
    });
  });
});
