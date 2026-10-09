// @vitest-environment node
import { describe, expect, it } from "vitest";

import { clientKey, createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  it("lets a caller through up to the limit, then refuses until the window ends", () => {
    const allow = createRateLimiter({ windowMs: 1000, max: 2 });

    expect(allow("a", 0)).toBe(true);
    expect(allow("a", 10)).toBe(true);
    expect(allow("a", 20)).toBe(false);
    expect(allow("a", 1001)).toBe(true);
  });

  it("counts each caller on their own", () => {
    const allow = createRateLimiter({ windowMs: 1000, max: 1 });

    expect(allow("a", 0)).toBe(true);
    expect(allow("b", 0)).toBe(true);
    expect(allow("a", 1)).toBe(false);
  });
});

describe("clientKey", () => {
  it("prefers the address the platform set", () => {
    const request = new Request("https://x.example", {
      headers: {
        "x-vercel-forwarded-for": "1.1.1.1",
        "x-forwarded-for": "9.9.9.9, 8.8.8.8",
      },
    });

    expect(clientKey(request)).toBe("1.1.1.1");
  });

  it("falls back on the first forwarded hop", () => {
    const request = new Request("https://x.example", {
      headers: { "x-forwarded-for": "9.9.9.9, 8.8.8.8" },
    });

    expect(clientKey(request)).toBe("9.9.9.9");
  });
});
