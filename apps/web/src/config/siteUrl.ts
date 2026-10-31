/**
 * The address this deployment is served from, for the places that must name
 * it absolutely: the sitemap, robots.txt and the link previews other sites
 * build. `NEXT_PUBLIC_SITE_URL` wins; Vercel's production URL is the fallback
 * so a deployment without the variable still names itself correctly.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
