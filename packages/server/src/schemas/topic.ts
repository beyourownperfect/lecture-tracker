import { z } from "zod";

export const createTopicSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  order: z.number().int().default(0),
  subjectId: z.string().min(1, "Subject ID is required"),
});

export const updateTopicSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  order: z.number().int().optional(),
  totalPyqs: z.number().int().min(0).optional(),
  solvedPyqs: z.number().int().min(0).optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
