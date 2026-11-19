import { z } from "zod";

import { BlogTagKind } from "@/lib/graphql/generated";

import {
  MAX_BODY_LENGTH,
  MAX_IMAGES,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
} from "../constants/blog";
import { countImageReferences } from "../markdown/references";

/** The sentences of the post form's rules, in the language of the page. */
export type PostSchemaMessages = {
  titleRequired: string;
  titleTooLong: string;
  bodyRequired: string;
  bodyTooLong: string;
  tooManyTags: string;
  tooManyImages: string;
};

/**
 * The rules of a post - the backend's (SavePostRequest, BlogPost): a title of
 * 1-200 characters once trimmed, a text of 1-20 000 that is not only blanks, at
 * most 8 tags, and at most 10 images, counted as the backend counts them: the
 * distinct `blog-image:<id>` references in the text. The backend decides; this
 * is for saying so before a save is sent.
 *
 * A tag is a kind and a value; which values exist for a kind is the backend's
 * catalogue, so the form offers only those and a value is not checked here.
 */
export function createPostSchema(m: PostSchemaMessages) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, m.titleRequired)
      .max(MAX_TITLE_LENGTH, m.titleTooLong),
    body: z
      .string()
      .max(MAX_BODY_LENGTH, m.bodyTooLong)
      .refine((value) => value.trim().length > 0, m.bodyRequired)
      .refine(
        (value) => countImageReferences(value) <= MAX_IMAGES,
        m.tooManyImages,
      ),
    tags: z
      .array(z.object({ kind: z.enum(BlogTagKind), value: z.string().min(1) }))
      .max(MAX_TAGS, m.tooManyTags),
  });
}

export type PostFormValues = z.infer<ReturnType<typeof createPostSchema>>;
