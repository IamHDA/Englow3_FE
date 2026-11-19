/**
 * How the text of a post points at its images: `blog-image:<id>`, never a URL.
 * The backend keeps the text as it was written and hands the reader a
 * short-lived link for each id; the page swaps one for the other as it draws.
 */
export const BLOG_IMAGE_SCHEME = "blog-image:";

/**
 * Only a well-formed id counts as a reference, as on the backend
 * (BlogMarkdown.IMAGE_REFERENCE): `blog-image:oops` is text somebody typed.
 */
const IMAGE_REFERENCE =
  /blog-image:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;

/** The ids a text names, lower case, in order of first appearance, each once. */
export function imageReferenceIds(body: string): string[] {
  const ids = new Set<string>();
  for (const match of body.matchAll(IMAGE_REFERENCE)) {
    ids.add(match[1].toLowerCase());
  }
  return [...ids];
}

/** How many images a text names: what counts against a post's limit of ten. */
export function countImageReferences(body: string): number {
  return imageReferenceIds(body).length;
}

/** What goes into the text for an image: the reference the backend returned, with the person's description. */
export function imageMarkdown(reference: string, alt: string): string {
  // A "]" or a line break in the description would end it early.
  const safeAlt = alt
    .replace(/[[\]\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `![${safeAlt}](${reference})`;
}
