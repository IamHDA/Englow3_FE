import { BLOG_IMAGE_SCHEME } from "./references";

/**
 * Every character a browser strips from, or would read as the end of, an
 * address - controls and spaces. "/\t/evil.example" is "//evil.example" once
 * the browser has dropped the tab, so an address with one is not trusted at all.
 */
const UNSAFE_CHARACTERS = /[\u0000- \u007f-\u009f]/;

/** An https address. Nothing else leaves the site: no http, no data:, no javascript:. */
const HTTPS_ADDRESS = /^https:\/\/[^/\\]/i;

/** A path on this site: one slash, then not another slash or a backslash (both make "//host"). */
const SITE_PATH = /^\/(?![/\\])/;

/**
 * What an image of a post may be drawn from, which is decided here and nowhere
 * else: only `blog-image:<id>` for an id the post's own `images` hold. Every
 * other address - an https one, data:, a relative one, a `blog-image:` that is
 * not in the map - comes back as "" and the image is not drawn at all.
 *
 * An image from another site would let its owner see who opens a post, and
 * when, from where: the reader's browser asks that site for it. That is the
 * reason there is no exception.
 *
 * `images` maps the lower-case id to the address to draw: the backend's
 * short-lived link, or a `blob:` address for a picture just chosen in the
 * editor.
 */
export function resolveImageSrc(
  url: string,
  images: ReadonlyMap<string, string>,
): string {
  if (!url.toLowerCase().startsWith(BLOG_IMAGE_SCHEME)) return "";
  const id = url.slice(BLOG_IMAGE_SCHEME.length).toLowerCase();
  return images.get(id) ?? "";
}

/**
 * Where a link of a post may go: an https address, or a path on this site. The
 * rest - javascript:, data:, `//host`, http, `blog-image:` - is "", and the
 * link is drawn as plain text.
 */
export function resolveLinkHref(url: string): string {
  if (UNSAFE_CHARACTERS.test(url)) return "";
  return HTTPS_ADDRESS.test(url) || SITE_PATH.test(url) ? url : "";
}

/** Whether a link that passed `resolveLinkHref` leaves the site (and so opens a new tab). */
export function isExternalHref(href: string): boolean {
  return HTTPS_ADDRESS.test(href);
}
