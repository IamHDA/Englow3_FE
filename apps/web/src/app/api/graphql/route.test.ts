// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

const getSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getSession: () => getSession() },
  }),
}));

import { POST } from "./route";

const fetchMock = vi.fn();

function call(body: string, headers: Record<string, string> = {}) {
  return new Request("https://englow.example/api/graphql", {
    method: "POST",
    headers: {
      host: "englow.example",
      "content-type": "application/json",
      [CSRF_HEADER]: CSRF_VALUE,
      ...headers,
    },
    body,
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  getSession.mockReset();
  fetchMock.mockResolvedValue(
    Response.json({ data: { health: "ok" } }, { status: 200 }),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/graphql", () => {
  it("adds the signed-in user's token on the server and returns the BFF's answer", async () => {
    getSession.mockResolvedValue({
      data: { session: { access_token: "the-token" } },
    });

    const response = await POST(call('{"query":"{ health }"}'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { health: "ok" } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.authorization).toBe("Bearer the-token");
    expect(init.body).toBe('{"query":"{ health }"}');
  });

  it("sends a guest on without any token", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    await POST(call('{"query":"{ health }"}'));

    expect(fetchMock.mock.calls[0][1].headers.authorization).toBeUndefined();
  });

  it("never passes the caller's own Authorization header through", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    await POST(call("{}", { authorization: "Bearer forged" }));

    expect(fetchMock.mock.calls[0][1].headers.authorization).toBeUndefined();
  });

  it("refuses a call another site could have caused, before reading the session", async () => {
    const response = await POST(call("{}", { origin: "https://evil.example" }));

    expect(response.status).toBe(403);
    expect(getSession).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a document larger than any real query", async () => {
    const response = await POST(call("x".repeat(129 * 1024)));

    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers in the shape Apollo reads when the BFF cannot be reached", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    fetchMock.mockRejectedValue(new Error("down"));

    const response = await POST(call("{}"));

    expect(response.status).toBe(502);
    expect((await response.json()).errors[0].extensions.code).toBe(
      "BACKEND_UNAVAILABLE",
    );
  });
});
