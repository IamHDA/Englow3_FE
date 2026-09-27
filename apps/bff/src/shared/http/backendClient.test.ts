import { afterEach, describe, expect, it, vi } from "vitest";

import { BackendClient, createBackendClient } from "./backendClient.js";
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
      method: "GET",
      path: "/api/user/me",
      durationMs: expect.any(Number),
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

  it("posts with no body and no content-type header", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new BackendClient("http://backend.internal", 5000);
    const result = await client.post("/api/admin/exams/e1/publish");

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.internal/api/admin/exams/e1/publish");
    expect(init.method).toBe("POST");
    expect(init.body).toBeUndefined();
    expect(init.headers).not.toHaveProperty("content-type");
  });

  it("posts a JSON body with a content-type header", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(201, { id: "e1" }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new BackendClient("http://backend.internal", 5000);
    await client.post("/api/admin/exams", { title: "Mock TOEIC" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(JSON.stringify({ title: "Mock TOEIC" }));
    expect(init.headers).toMatchObject({
      "content-type": "application/json",
    });
  });

  // The import route hands the backend's own refusal on to the author, rows and
  // all - a client that threw here would leave it nothing to hand on.
  it("send() returns a refusal as a response instead of throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(400, { code: "NOT_A_LIST" })),
    );

    const response = await new BackendClient(
      "http://backend.internal",
      5000,
    ).send("POST", "/api/admin/flashcards/import/validate");

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "NOT_A_LIST" });
  });

  it("sends a FormData body as it is, leaving the multipart content-type to fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    const form = new FormData();

    await new BackendClient("http://backend.internal", 5000, "t").send(
      "POST",
      "/api/admin/dictation/import",
      form,
    );

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers).not.toHaveProperty("content-type");
  });
});

describe("createBackendClient", () => {
  it("carries the bearer token of the incoming request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);

    const { token, client } = createBackendClient({
      authorization: "Bearer the-token",
    });
    await client.get("/api/user/me");

    expect(token).toBe("the-token");
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      authorization: "Bearer the-token",
    });
  });

  it("makes one request id per request, shared by every backend call it fans out into", async () => {
    // A fresh Response per call: a body can only be read once.
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => jsonResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    const first = createBackendClient({});
    await first.client.get("/a");
    await first.client.get("/b");
    await createBackendClient({}).client.get("/c");

    const [a, b, c] = fetchMock.mock.calls.map(
      ([, init]) => init.headers["x-request-id"],
    );
    expect(a).toMatch(uuid);
    expect(first.requestId).toBe(a);
    expect(b).toBe(a); // one request, one id, however many backend calls
    expect(c).toMatch(uuid);
    expect(c).not.toBe(a);
  });

  it("reuses the caller's x-request-id when it is a well-formed UUID", () => {
    const { requestId } = createBackendClient({
      "x-request-id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    });

    expect(requestId).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  });

  it("replaces a caller's x-request-id that is not a UUID instead of forwarding it as-is", () => {
    const { requestId } = createBackendClient({
      "x-request-id": "from-the-caller",
    });

    expect(requestId).not.toBe("from-the-caller");
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("treats anything but a bearer token as no token", () => {
    for (const authorization of [
      undefined,
      "Basic abc",
      "Bearer ",
      "Bearer   ",
    ]) {
      expect(createBackendClient({ authorization }).token).toBeNull();
    }
  });
});
