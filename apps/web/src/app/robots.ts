import type { MetadataRoute } from "next";

import { siteUrl } from "@/config/siteUrl";

/**
 * Crawlers may read the public pages and nothing else. Everything below is
 * either an API or a screen that needs an account, where a crawler would only
 * be redirected to the landing page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/auth",
        "/study",
        "/exams",
        "/ai-tutor",
        "/profile",
        "/dictation",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
