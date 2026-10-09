import { describe, expect, it } from "vitest";

import {
  contentSecurityPolicy,
  createNonce,
  SECURITY_HEADERS,
} from "./securityHeaders";

function directive(policy: string, name: string) {
  return policy.split("; ").find((part) => part.startsWith(`${name} `));
}

const production = (nonce = "abc123") =>
  contentSecurityPolicy({ nonce, development: false });
const development = (nonce = "abc123") =>
  contentSecurityPolicy({ nonce, development: true });

describe("contentSecurityPolicy", () => {
  it("lets a production page talk only to https services", () => {
    const policy = production();

    expect(directive(policy, "connect-src")).toBe(
      "connect-src 'self' https: wss:",
    );
    expect(policy).not.toContain("localhost");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  // The point of the nonce: an injected <script> does not have it, and without
  // 'unsafe-inline' the browser refuses to run one that lacks it.
  it("runs only scripts that carry this response's nonce", () => {
    const scripts = directive(production("n0nce"), "script-src");

    expect(scripts).toContain("'nonce-n0nce'");
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(production("a")).not.toBe(production("b"));
  });

  // The local object storage is http://localhost:9000. Without this every
  // request the app made in development was refused.
  it("lets local development reach the http services on localhost", () => {
    const policy = development();

    expect(directive(policy, "connect-src")).toContain("http://localhost:*");
    expect(directive(policy, "media-src")).toContain("http://localhost:*");
    expect(directive(policy, "script-src")).toContain("'unsafe-eval'");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });

  it("refuses framing, plugins and a changed base address", () => {
    const policy = production();

    expect(directive(policy, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(policy, "object-src")).toBe("object-src 'none'");
    expect(directive(policy, "base-uri")).toBe("base-uri 'self'");
  });
});

describe("createNonce", () => {
  it("is different every time and safe inside a header", () => {
    const first = createNonce();

    expect(first).not.toBe(createNonce());
    expect(first).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});

describe("SECURITY_HEADERS", () => {
  // proxy.ts sets the policy per request; a second, static one would be
  // enforced alongside it.
  it("leaves the Content-Security-Policy to the proxy", () => {
    expect(SECURITY_HEADERS.map((h) => h.key)).not.toContain(
      "Content-Security-Policy",
    );
    expect(SECURITY_HEADERS.map((h) => h.key)).toContain(
      "X-Content-Type-Options",
    );
  });
});
