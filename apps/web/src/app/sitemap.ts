import type { MetadataRoute } from "next";

import { siteUrl } from "@/config/siteUrl";

/** The pages a visitor can read without an account. */
const PUBLIC_PATHS = ["/", "/welcome", "/pricing", "/terms", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    changeFrequency: path === "/" || path === "/welcome" ? "weekly" : "monthly",
    priority: path === "/" || path === "/welcome" ? 1 : 0.5,
  }));
}
