import { describe, expect, it } from "vitest";

import { hardenedCookieOptions, isHttps } from "./cookies";

const supabaseDefaults = {
  path: "/",
  sameSite: "lax" as const,
  httpOnly: false,
  maxAge: 400 * 24 * 60 * 60,
};

describe("hardenedCookieOptions", () => {
  it("hides the session from scripts, whatever the SDK asked for", () => {
    const options = hardenedCookieOptions(supabaseDefaults, {
      secure: true,
      sessionOnly: false,
    });

    expect(options.httpOnly).toBe(true);
    expect(options.secure).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.maxAge).toBe(supabaseDefaults.maxAge);
  });

  it("is only Secure where the request was, so http://localhost keeps its session", () => {
    expect(
      hardenedCookieOptions(supabaseDefaults, {
        secure: false,
        sessionOnly: false,
      }).secure,
    ).toBe(false);
  });

  it("drops the expiry for someone who did not ask to be remembered", () => {
    const options = hardenedCookieOptions(
      { ...supabaseDefaults, expires: new Date() },
      { secure: true, sessionOnly: true },
    );

    expect(options.maxAge).toBeUndefined();
    expect(options.expires).toBeUndefined();
    expect(options.httpOnly).toBe(true);
  });

  it("still lets a cookie be deleted when the session ends with the browser", () => {
    const options = hardenedCookieOptions(
      { ...supabaseDefaults, maxAge: 0 },
      { secure: true, sessionOnly: true },
    );

    expect(options.maxAge).toBe(0);
  });
});

describe("isHttps", () => {
  it("trusts the proxy's word for the scheme", () => {
    expect(isHttps(new Headers({ "x-forwarded-proto": "https,http" }))).toBe(
      true,
    );
    expect(isHttps(new Headers({ "x-forwarded-proto": "http" }))).toBe(false);
  });

  it("falls back on the request's own scheme", () => {
    expect(isHttps(new Headers(), "https:")).toBe(true);
    expect(isHttps(new Headers(), "http:")).toBe(false);
  });
});
