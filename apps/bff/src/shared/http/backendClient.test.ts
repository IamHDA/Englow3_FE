import { afterEach, describe, expect, it, vi } from "vitest";

import { BackendClient } from "./backendClient.js";
import { BackendError } from "./backendError.js";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BackendClient", () => {
  it("requests baseUrl + path with the bearer token and request id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new BackendClient(
      "http://backend.internal",
      5000,
      "the-token",
      "req-123",
    );
    const result = await client.get("/api/user/me");

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.internal/api/user/me",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          authorization: "Bearer the-token",
          "x-request-id": "req-123",
        }),
      }),
    );
  });

  it("omits the authorization header when there is no token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new BackendClient("http://backend.internal", 5000);
    await client.get("/api/user/me");

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("authorization");
  });

  it("throws a BackendError built from the response body when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(401, { code: "UNAUTHENTICATED", message: "no token" }),
        ),
    );

    const client = new BackendClient("http://backend.internal", 5000);

    await expect(client.get("/api/user/me")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHENTICATED",
      message: "no token",
    });
  });

  it("throws a status-0 BackendError when the backend is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    );

    const client = new BackendClient("http://backend.internal", 5000);

    await expect(client.get("/api/user/me")).rejects.toBeInstanceOf(
      BackendError,
    );
    await expect(client.get("/api/user/me")).rejects.toMatchObject({
      status: 0,
    });
  });
});
