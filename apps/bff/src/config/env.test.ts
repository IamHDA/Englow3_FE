import { describe, expect, it } from "vitest";

import { positiveInt, requiredString, requiredUrl } from "./env.js";

describe("requiredString", () => {
  it("uses the raw value when set", () => {
    expect(requiredString("X", "value", "fallback")).toBe("value");
  });

  it("falls back when unset", () => {
    expect(requiredString("X", undefined, "fallback")).toBe("fallback");
  });

  /**
   * `FOO=` in a `.env` file is almost always a forgotten value, not an
   * intentional empty string, so it is treated the same as unset.
   */
  it("treats a blank value as unset", () => {
    expect(requiredString("X", "", "fallback")).toBe("fallback");
  });

  it("throws when neither the value nor a fallback is set", () => {
    expect(() => requiredString("X", undefined)).toThrow(/X/);
  });
});

describe("requiredUrl", () => {
  it("accepts a well-formed url", () => {
    expect(requiredUrl("X", "https://example.com")).toBe("https://example.com");
  });

  it("throws on a malformed url so a typo fails at startup, not on first use", () => {
    expect(() => requiredUrl("X", "not-a-url")).toThrow(/X/);
  });
});

describe("positiveInt", () => {
  it("parses a numeric string", () => {
    expect(positiveInt("X", "300")).toBe(300);
  });

  it("falls back when unset", () => {
    expect(positiveInt("X", undefined, 300)).toBe(300);
  });

  it("throws on a non-numeric value instead of silently becoming NaN", () => {
    expect(() => positiveInt("X", "abc")).toThrow(/X/);
  });

  it("throws on zero or negative values", () => {
    expect(() => positiveInt("X", "0")).toThrow(/X/);
    expect(() => positiveInt("X", "-1")).toThrow(/X/);
  });

  it("throws on a non-integer value", () => {
    expect(() => positiveInt("X", "1.5")).toThrow(/X/);
  });
});
