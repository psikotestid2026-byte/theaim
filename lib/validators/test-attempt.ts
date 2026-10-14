import { z } from "zod";

export const positiveId = z.coerce.number().int().positive();

export const confirmBody = z.object({
  token: z.string().uuid(),
  last4: z.string().length(4),
});

export const testResponseBody = z.object({
  token: z.string().uuid(),
  session_id: positiveId,
  item_id: positiveId,
  answer_value: z.string().min(1),
});

export const completeBody = z.object({
  token: z.string().uuid(),
  session_id: positiveId,
});
