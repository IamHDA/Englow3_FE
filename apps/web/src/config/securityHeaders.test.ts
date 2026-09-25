import { describe, expect, it } from "vitest";

import { contentSecurityPolicy } from "./securityHeaders";

function directive(policy: string, name: string) {
  return policy.split("; ").find((part) => part.startsWith(`${name} `));
}

describe("contentSecurityPolicy", () => {
  it("lets a production page talk only to https services", () => {
    const policy = contentSecurityPolicy(false);

    expect(directive(policy, "connect-src")).toBe(
      "connect-src 'self' https: wss:",
    );
    expect(policy).not.toContain("localhost");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  // The local BFF is http://localhost:4000. Without this every request the
  // app made in development was refused and no screen could load its data.
  it("lets local development reach the http services on localhost", () => {
    const policy = contentSecurityPolicy(true);

    expect(directive(policy, "connect-src")).toContain("http://localhost:*");
    expect(directive(policy, "media-src")).toContain("http://localhost:*");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });
});
