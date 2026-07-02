import { z } from "zod";

export const createLectureSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  duration: z.number().int().min(0).default(0),
  order: z.number().int().default(0),
  topicId: z.string().min(1, "Topic ID is required"),
  completed: z.boolean().default(false),
});

export const updateLectureSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().datetime().nullable().optional(),
});

export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type UpdateLectureInput = z.infer<typeof updateLectureSchema>;
