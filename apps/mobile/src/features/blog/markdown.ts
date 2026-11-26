/**
 * The web's rules for what a post may point at
 * (apps/web/src/features/blog/markdown/references.ts and urls.ts): images
 * only through the post's own `blog-image:<uuid>` references, links only to
 * https or a path on the site. Anything else renders as nothing.
 */
export const BLOG_IMAGE_SCHEME = "blog-image:";

const IMAGE_REFERENCE =
  /blog-image:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
const UNSAFE_CHARACTERS = /[\u0000- \u007f-\u009f]/;
const HTTPS_ADDRESS = /^https:\/\/[^/\\]/i;
const SITE_PATH = /^\/(?![/\\])/;

export const MAX_TITLE_LENGTH = 200;
export const MAX_BODY_LENGTH = 20_000;
export const MAX_TAGS = 8;
export const MAX_IMAGES = 10;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function imageReferenceIds(body: string): string[] {
  const ids = new Set<string>();
  for (const match of body.matchAll(IMAGE_REFERENCE))
    ids.add((match[1] ?? "").toLowerCase());
  return [...ids];
}

export function resolveImageSrc(
  url: string,
  images: ReadonlyMap<string, string>,
): string {
  if (!url.toLowerCase().startsWith(BLOG_IMAGE_SCHEME)) return "";
  return images.get(url.slice(BLOG_IMAGE_SCHEME.length).toLowerCase()) ?? "";
}

/** "" for an address the app will not open; a site path becomes a web URL. */
export function resolveLinkHref(url: string, webUrl: string): string {
  if (UNSAFE_CHARACTERS.test(url)) return "";
  if (HTTPS_ADDRESS.test(url)) return url;
  if (SITE_PATH.test(url)) return `${webUrl}${url}`;
  return "";
}

export function imageMarkdown(reference: string, alt: string): string {
  const safeAlt = alt
    .replace(/[[\]\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `![${safeAlt}](${reference})`;
}
