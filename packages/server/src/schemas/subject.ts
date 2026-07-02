import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  order: z.number().int().default(0),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  order: z.number().int().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
