// @vitest-environment node
import { describe, expect, it } from "vitest";

import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

import { refuseCrossSite, requestOrigin } from "./csrf";

function request(headers: Record<string, string>) {
  return new Request("https://englow.example/api/graphql", {
    method: "POST",
    headers: { host: "englow.example", ...headers },
  });
}

const own = { [CSRF_HEADER]: CSRF_VALUE };

describe("refuseCrossSite", () => {
  it("lets this app's own call through", () => {
    expect(
      refuseCrossSite(
        request({
          ...own,
          origin: "https://englow.example",
          "sec-fetch-site": "same-origin",
        }),
      ),
    ).toBeNull();
  });

  it("lets through a call that carries no Origin at all", () => {
    expect(refuseCrossSite(request(own))).toBeNull();
  });

  it("refuses a request without the header a cross-site page cannot add", async () => {
    const refused = refuseCrossSite(
      request({ origin: "https://englow.example" }),
    );

    expect(refused?.status).toBe(403);
    expect((await refused?.json())?.reason).toBe("missing-header");
  });

  it("refuses a request the browser says came from another site", () => {
    expect(
      refuseCrossSite(request({ ...own, "sec-fetch-site": "cross-site" }))
        ?.status,
    ).toBe(403);
    expect(
      refuseCrossSite(request({ ...own, "sec-fetch-site": "same-site" }))
        ?.status,
    ).toBe(403);
  });

  it("refuses an Origin that is not this host, or not a URL", () => {
    expect(
      refuseCrossSite(request({ ...own, origin: "https://evil.example" }))
        ?.status,
    ).toBe(403);
    expect(refuseCrossSite(request({ ...own, origin: "null" }))?.status).toBe(
      403,
    );
  });

  it("compares against the host the proxy forwarded", () => {
    expect(
      refuseCrossSite(
        request({
          ...own,
          host: "internal-1234.vercel.internal",
          "x-forwarded-host": "englow.example",
          origin: "https://englow.example",
        }),
      ),
    ).toBeNull();
  });
});

describe("requestOrigin", () => {
  it("prefers the page's own origin over the server's view of the URL", () => {
    expect(requestOrigin(request({ origin: "http://localhost:3000" }))).toBe(
      "http://localhost:3000",
    );
    expect(requestOrigin(request({}))).toBe("https://englow.example");
  });
});
