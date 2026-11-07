import { z } from "zod";
import { BRIEF_MAX_LENGTH } from "../../../constants/generation";

export function generationRequestSchema(isVi: boolean) {
  return z.object({
    brief: z
      .string()
      .trim()
      .max(
        BRIEF_MAX_LENGTH,
        isVi
          ? `Yêu cầu riêng tối đa ${BRIEF_MAX_LENGTH} ký tự.`
          : `The brief is at most ${BRIEF_MAX_LENGTH} characters.`,
      ),
  });
}

export type GenerationRequestValues = z.infer<
  ReturnType<typeof generationRequestSchema>
>;
