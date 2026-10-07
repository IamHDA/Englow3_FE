import { z } from "zod";
const draft = z.object({
  criteria: z
    .array(
      z.object({
        key: z.string(),
        score: z.union([z.number(), z.literal("")]),
        feedback: z.string(),
        quote: z.string(),
        audioStart: z.union([z.number(), z.literal("")]),
        audioEnd: z.union([z.number(), z.literal("")]),
      }),
    )
    .length(4),
  summary: z.string(),
  strengths: z.string(),
  improvements: z.string(),
  note: z.string(),
  transcript: z.string(),
});
export const isGradingDraft = (value: unknown) =>
  draft.safeParse(value).success;
