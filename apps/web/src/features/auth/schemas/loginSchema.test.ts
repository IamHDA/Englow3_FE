import { describe, expect, it } from "vitest";

import { loginSchema } from "./loginSchema";

describe("loginSchema", () => {
  it("accepts a well-formed email", () => {
    const result = loginSchema.safeParse({
      email: "hoa@englow3.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("trims surrounding whitespace off the email", () => {
    const result = loginSchema.safeParse({
      email: "  hoa@englow3.com  ",
      password: "secret",
    });
    expect(result.success && result.data.email).toBe("hoa@englow3.com");
  });

  it("rejects a malformed email", () => {
    for (const email of ["hoa@", "hoa", "hoa@englow3"]) {
      const result = loginSchema.safeParse({ email, password: "secret" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("Enter a valid email address");
    }
  });

  it("rejects an empty email, including whitespace only", () => {
    for (const email of ["", "   "]) {
      const result = loginSchema.safeParse({ email, password: "secret" });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("Enter your email");
    }
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "hoa@englow3.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Enter your password");
  });

  it("does not impose a minimum password length, so existing accounts still work", () => {
    const result = loginSchema.safeParse({ email: "hoa@englow3.com", password: "a" });
    expect(result.success).toBe(true);
  });
});
