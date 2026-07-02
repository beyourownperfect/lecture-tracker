import { z } from "zod";

export const createTestSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  date: z.string().datetime(),
  score: z.number().min(0).max(200).nullable().default(null),
  completed: z.boolean().default(false),
});

export const updateTestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  date: z.string().datetime().optional(),
  score: z.number().min(0).max(200).nullable().optional(),
  completed: z.boolean().optional(),
});

export type CreateTestInput = z.infer<typeof createTestSchema>;
export type UpdateTestInput = z.infer<typeof updateTestSchema>;
