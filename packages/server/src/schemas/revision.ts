import { z } from "zod";

export const createRevisionSchema = z.object({
  type: z.enum(["NOTES", "FLASHCARDS"]),
  scheduledDate: z.string().datetime(),
  completed: z.boolean().default(false),
  lectureId: z.string().min(1, "Lecture ID is required"),
});

export const updateRevisionSchema = z.object({
  type: z.enum(["NOTES", "FLASHCARDS"]).optional(),
  scheduledDate: z.string().datetime().optional(),
  completed: z.boolean().optional(),
});

export type CreateRevisionInput = z.infer<typeof createRevisionSchema>;
export type UpdateRevisionInput = z.infer<typeof updateRevisionSchema>;
