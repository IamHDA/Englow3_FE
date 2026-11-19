import { z } from "zod";

import { MAX_COMMENT_LENGTH } from "../constants/blog";

export type CommentSchemaMessages = {
  required: string;
  tooLong: string;
};

/** A comment: 1-2000 characters that are not only blanks (SaveCommentRequest). */
export function createCommentSchema(m: CommentSchemaMessages) {
  return z.object({
    body: z
      .string()
      .max(MAX_COMMENT_LENGTH, m.tooLong)
      .refine((value) => value.trim().length > 0, m.required),
  });
}

export type CommentFormValues = z.infer<ReturnType<typeof createCommentSchema>>;
