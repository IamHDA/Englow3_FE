import { describe, expect, it } from "vitest";

import { parseAllowedOrigins } from "./env.js";

describe("parseAllowedOrigins", () => {
  /**
   * An unset variable means any origin, which is what a developer running the
   * web app on an unpredictable port needs. It is also why a deployment has to
   * set it: the default is the permissive one.
   */
  it("allows any origin when nothing is configured", () => {
    expect(parseAllowedOrigins(undefined)).toEqual([]);
    expect(parseAllowedOrigins("")).toEqual([]);
  });

  it("reads a comma separated list", () => {
    expect(
      parseAllowedOrigins("https://englow.app,https://staging.englow.app"),
    ).toEqual(["https://englow.app", "https://staging.englow.app"]);
  });

  /**
   * A trailing comma must not become an origin of "". The cors package treats
   * an empty string in the list as an origin to match, and a request with no
   * Origin header would then be let through as if it were on the allowlist.
   */
  it("drops blanks and trims whitespace", () => {
    expect(parseAllowedOrigins(" https://englow.app , ,")).toEqual([
      "https://englow.app",
    ]);
  });
});
