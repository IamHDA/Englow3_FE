import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

afterEach(() => vi.unstubAllEnvs());

describe("robots.txt", () => {
  it("keeps crawlers out of the API and the screens that need an account", () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;

    expect(rule.disallow).toEqual(
      expect.arrayContaining(["/api/", "/admin", "/study", "/profile"]),
    );
    expect(rule.allow).toBe("/");
  });

  it("points at the sitemap of the configured site", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://englow3.example/");

    expect(robots().sitemap).toBe("https://englow3.example/sitemap.xml");
  });
});

describe("sitemap.xml", () => {
  it("lists only pages a visitor can read, on the configured site", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://englow3.example");

    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual([
      "https://englow3.example",
      "https://englow3.example/welcome",
      "https://englow3.example/pricing",
      "https://englow3.example/terms",
      "https://englow3.example/privacy",
    ]);
    expect(urls.some((url) => /\/(study|admin|profile|api)/.test(url))).toBe(
      false,
    );
  });
});
