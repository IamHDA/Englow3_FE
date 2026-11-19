import { z } from "zod";

import { MAX_MESSAGE_LENGTH } from "../constants/chat";

/**
 * The text of a message. Whether a message needs text or an image is not here:
 * the image is not part of the form's values, and the box decides whether it can
 * send from the two together. The length is the backend's (4000), so the box
 * says so while the person types rather than after the send was refused.
 */
export function createMessageSchema(tooLong: string) {
  return z.object({
    body: z.string().max(MAX_MESSAGE_LENGTH, tooLong),
  });
}

export type MessageFormValues = z.infer<ReturnType<typeof createMessageSchema>>;
