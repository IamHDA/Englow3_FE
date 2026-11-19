import { z } from "zod";

import { BlogModerationAction } from "@/lib/graphql/generated";

import { MAX_MODERATION_REASON_LENGTH } from "../constants/blog";

export type ModerationSchemaMessages = {
  actionRequired: string;
  reasonRequired: string;
  reasonTooLong: string;
};

/** What a moderator decides: an action, and always a reason of 1-500 characters (ModerationActionRequest). */
export function createModerationSchema(m: ModerationSchemaMessages) {
  return z.object({
    action: z.enum(BlogModerationAction, { error: m.actionRequired }),
    reason: z
      .string()
      .trim()
      .min(1, m.reasonRequired)
      .max(MAX_MODERATION_REASON_LENGTH, m.reasonTooLong),
  });
}

export type ModerationFormValues = z.infer<
  ReturnType<typeof createModerationSchema>
>;
