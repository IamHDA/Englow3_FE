"use client";

import { useCallback } from "react";

import {
  IMAGE_ACCEPTED_TYPES,
  IMAGE_MAX_BYTES,
  IMAGE_UPLOAD_TIMEOUT_MS,
} from "../constants/chat";

/** Why a file cannot be sent as a chat image, found before anything is asked of the backend. */
export const IMAGE_PROBLEM = {
  type: "type",
  size: "size",
  empty: "empty",
} as const;

export type ImageProblem = (typeof IMAGE_PROBLEM)[keyof typeof IMAGE_PROBLEM];

/** `upload` was given a file `validate` refuses. */
export class ImageRejected extends Error {
  constructor(readonly problem: ImageProblem) {
    super(`Chat image refused: ${problem}`);
    this.name = "ImageRejected";
  }
}

type Options = {
  /** Asks the backend for a URL to PUT the file to - the `startChatImageUpload` mutation. */
  startUpload: (variables: {
    conversationId: string;
    contentType: string;
    contentLength: number;
  }) => Promise<{ uploadId: string; uploadUrl: string; contentType: string }>;
};

const isAcceptedType = (type: string): boolean =>
  (IMAGE_ACCEPTED_TYPES as readonly string[]).includes(type);

/**
 * A chat image's way to the backend: check the file, ask for an upload URL,
 * PUT the bytes straight to object storage, hand back the upload id a message
 * names. The PUT is the one request in the chat that does not go through the
 * BFF - it is to a presigned address that carries its own permission, and an
 * image through a serverless function would be paid for twice.
 *
 * The check here is only to say so early: the backend decides what is accepted,
 * binds the type and size into the signature, and checks the object when the
 * message is sent.
 */
export function useImageUpload({ startUpload }: Options) {
  /** What is wrong with the file, or null when it can be sent. */
  const validate = useCallback((file: File): ImageProblem | null => {
    if (!isAcceptedType(file.type)) return IMAGE_PROBLEM.type;
    if (file.size <= 0) return IMAGE_PROBLEM.empty;
    if (file.size > IMAGE_MAX_BYTES) return IMAGE_PROBLEM.size;
    return null;
  }, []);

  /** Resolves to the upload id once the bytes are in storage. Rejects if any step failed - then there is nothing to send a message about. */
  const upload = useCallback(
    async (conversationId: string, file: File): Promise<string> => {
      const problem = validate(file);
      if (problem) throw new ImageRejected(problem);

      const target = await startUpload({
        conversationId,
        contentType: file.type,
        contentLength: file.size,
      });
      const response = await fetch(target.uploadUrl, {
        method: "PUT",
        // The type the signature was made for, as the backend returned it.
        headers: { "Content-Type": target.contentType },
        body: file,
        signal: AbortSignal.timeout(IMAGE_UPLOAD_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`Image upload failed with ${response.status}`);
      }
      return target.uploadId;
    },
    [startUpload, validate],
  );

  return { validate, upload };
}
