import { describe, expect, it } from "vitest";

import { parseAllowedOrigins } from "./env.js";
import { callerAddress } from "./middleware.js";

describe("callerAddress", () => {
  const SECRET = "a-long-shared-secret";

  /**
   * Everyone in the browser reaches the BFF through the web app's server, so
   * the address it connects from is shared; the forwarded one is the person.
   */
  it("counts the forwarded address when the web server proves itself", () => {
    expect(callerAddress(SECRET, SECRET, "203.0.113.7", "10.0.0.1")).toBe(
      "203.0.113.7",
    );
    expect(callerAddress(SECRET, SECRET, "2001:db8::7", "10.0.0.1")).toBe(
      "2001:db8::7",
    );
  });

  it("ignores a forwarded address anyone else could have written", () => {
    expect(callerAddress(SECRET, undefined, "203.0.113.7", "10.0.0.1")).toBe(
      "10.0.0.1",
    );
    expect(callerAddress(SECRET, "wrong", "203.0.113.7", "10.0.0.1")).toBe(
      "10.0.0.1",
    );
    expect(callerAddress(SECRET, `${SECRET}x`, "203.0.113.7", "10.0.0.1")).toBe(
      "10.0.0.1",
    );
  });

  it("keeps counting by connection when no secret is configured", () => {
    expect(
      callerAddress(undefined, "anything", "203.0.113.7", "10.0.0.1"),
    ).toBe("10.0.0.1");
  });

  it("refuses a forwarded value that is not an address", () => {
    expect(callerAddress(SECRET, SECRET, "not-an-ip", "10.0.0.1")).toBe(
      "10.0.0.1",
    );
  });
});

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
