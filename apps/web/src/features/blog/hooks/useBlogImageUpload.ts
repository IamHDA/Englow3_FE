"use client";

import { useCallback } from "react";

import {
  IMAGE_ACCEPTED_TYPES,
  IMAGE_MAX_BYTES,
  IMAGE_UPLOAD_TIMEOUT_MS,
  MAX_IMAGES,
} from "../constants/blog";

/** Why a file cannot go into a post, found before anything is asked of the backend. */
export const IMAGE_PROBLEM = {
  type: "type",
  size: "size",
  empty: "empty",
  tooMany: "tooMany",
} as const;

export type ImageProblem = (typeof IMAGE_PROBLEM)[keyof typeof IMAGE_PROBLEM];

/** `upload` was given a file `validate` refuses. */
export class ImageRejected extends Error {
  constructor(readonly problem: ImageProblem) {
    super(`Blog image refused: ${problem}`);
    this.name = "ImageRejected";
  }
}

/** What the upload hands back: the text to put where the image goes, and the id it will be saved under. */
export type UploadedImage = {
  imageId: string;
  /** `blog-image:<id>` - written into the Markdown as the backend gave it, never a link. */
  reference: string;
};

type Options = {
  /** Asks the backend for an address to PUT the file to - the `startBlogImageUpload` mutation. */
  startUpload: (variables: {
    contentType: string;
    contentLength: number;
  }) => Promise<{
    imageId: string;
    uploadUrl: string;
    contentType: string;
    reference: string;
  }>;
};

const isAcceptedType = (type: string): boolean =>
  (IMAGE_ACCEPTED_TYPES as readonly string[]).includes(type);

/**
 * A blog image's way to the backend: check the file and the post's count, ask
 * for an upload address, PUT the bytes straight to object storage, and hand
 * back the reference to write into the text. The PUT is the one request in the
 * blog that does not go through the BFF - it is to a presigned address that
 * carries its own permission, and an image through a serverless function would
 * be paid for twice.
 *
 * What it never does is put an address in the text: only the reference. The
 * post is saved with the reference, and the backend checks that the object is
 * there when it is.
 *
 * The checks are to say so early: the backend decides what is accepted, binds
 * the type and size into the signature, and counts a post's images again on
 * save.
 */
export function useBlogImageUpload({ startUpload }: Options) {
  /** What is wrong with the file, or null when it can go in. `imagesInPost` is how many the text names already. */
  const validate = useCallback(
    (file: File, imagesInPost: number): ImageProblem | null => {
      if (!isAcceptedType(file.type)) return IMAGE_PROBLEM.type;
      if (file.size <= 0) return IMAGE_PROBLEM.empty;
      if (file.size > IMAGE_MAX_BYTES) return IMAGE_PROBLEM.size;
      if (imagesInPost >= MAX_IMAGES) return IMAGE_PROBLEM.tooMany;
      return null;
    },
    [],
  );

  /** Resolves once the bytes are in storage. Rejects if any step failed - then there is nothing to write into the text. */
  const upload = useCallback(
    async (file: File, imagesInPost: number): Promise<UploadedImage> => {
      const problem = validate(file, imagesInPost);
      if (problem) throw new ImageRejected(problem);

      const target = await startUpload({
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
      return { imageId: target.imageId, reference: target.reference };
    },
    [startUpload, validate],
  );

  return { validate, upload };
}
