// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

const getSession = vi.fn();
const signOut = vi.fn();
const rememberSessionPreference = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getSession: () => getSession(), signOut },
  }),
  rememberSessionPreference: (...args: unknown[]) =>
    rememberSessionPreference(...args),
}));

import { DELETE, GET, POST, PUT } from "./route";

const fetchMock = vi.fn();
const UUID = "123e4567-e89b-12d3-a456-426614174000";
const HANDLERS = { GET, POST, PUT, DELETE };
let caller = 0;

function call(
  method: keyof typeof HANDLERS,
  path: string,
  {
    headers = {},
    body,
    search = "",
    signal,
  }: {
    headers?: Record<string, string>;
    body?: string;
    search?: string;
    signal?: AbortSignal;
  } = {},
) {
  const request = new Request(
    `https://englow.example/api/bff/${path}${search}`,
    {
      method,
      headers: {
        host: "englow.example",
        // A fresh caller per request, so one test's calls never use up
        // another's allowance.
        "x-forwarded-for": `10.0.${Math.floor(caller / 250)}.${caller++ % 250}`,
        [CSRF_HEADER]: CSRF_VALUE,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...headers,
      },
      body,
      signal,
    },
  );
  return HANDLERS[method](request, {
    params: Promise.resolve({ path: path.split("/") }),
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockResolvedValue(Response.json({ ok: true }));
  getSession.mockReset().mockResolvedValue({
    data: { session: { access_token: "the-token" } },
  });
  signOut.mockReset().mockResolvedValue({ error: null });
  rememberSessionPreference.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

describe("/api/bff/[...path]", () => {
  it("passes GraphQL on to the BFF with the signed-in user's token", async () => {
    fetchMock.mockResolvedValue(Response.json({ data: { health: "ok" } }));

    const response = await call("POST", "graphql", {
      body: '{"query":"{ health }"}',
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { health: "ok" } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:4000/graphql");
    expect(init.headers.authorization).toBe("Bearer the-token");
    expect(await new Response(init.body).text()).toBe('{"query":"{ health }"}');
  });

  it.each([
    ["GET", `rest/admin/authoring/EXAM/${UUID}`, ""],
    ["PUT", `rest/admin/authoring/EXAM/${UUID}/content`, ""],
    ["POST", "rest/admin/dictation/import/validate", ""],
    ["POST", "rest/admin/subscriptions/revoke", ""],
    ["GET", "rest/account/subscription", ""],
    ["GET", `rest/tutor/recordings/requests/${UUID}`, ""],
    ["DELETE", `rest/tutor/recordings/${UUID}`, ""],
    ["GET", "rest/tutor/data", "?kind=MESSAGES&page=2"],
    [
      "GET",
      `rest/tutor/conversations/${UUID}/messages/${UUID}/events`,
      "?cursor=abc",
    ],
  ] as const)(
    "passes %s %s%s on unchanged, path and query alike",
    async (method, path, search) => {
      const response = await call(method, path, {
        search,
        body: method === "GET" || method === "DELETE" ? undefined : "{}",
      });

      expect(response.status).toBe(200);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`http://localhost:4000/${path}${search}`);
      expect(init.method).toBe(method);
      expect(init.headers.authorization).toBe("Bearer the-token");
    },
  );

  it("sends a guest on without any token", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    await call("POST", "graphql", { body: "{}" });

    expect(fetchMock.mock.calls[0][1].headers.authorization).toBeUndefined();
  });

  it("never passes the caller's own Authorization header through", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    await call("POST", "graphql", {
      body: "{}",
      headers: { authorization: "Bearer forged" },
    });

    expect(fetchMock.mock.calls[0][1].headers.authorization).toBeUndefined();
  });

  it.each([
    "admin/exams",
    "actuator/health",
    "rest/../actuator",
    "rest/./account",
    "rest//account",
    "rest/account%2Fexport",
    "",
  ])("does not reach %j, which is outside the BFF's routes", async (path) => {
    const response = await call("GET", path);

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a request another site could have caused, before reading the session", async () => {
    const response = await call("POST", "rest/admin/dictation/import", {
      body: "{}",
      headers: { origin: "https://evil.example" },
    });

    expect(response.status).toBe(403);
    expect(getSession).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lets the health probe through without the cross-site header", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ backend: "ready", ai: "ready" }),
    );

    const response = await call("GET", "system/status", {
      headers: { [CSRF_HEADER]: "" },
    });

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:4000/system/status",
    );
  });

  it("answers GraphQL in the shape Apollo reads when the BFF cannot be reached", async () => {
    fetchMock.mockRejectedValue(new Error("down"));

    const response = await call("POST", "graphql", { body: "{}" });

    expect(response.status).toBe(502);
    expect((await response.json()).errors[0].extensions.code).toBe(
      "BACKEND_UNAVAILABLE",
    );
  });

  it("answers REST with a code when the BFF cannot be reached", async () => {
    fetchMock.mockRejectedValue(new Error("down"));

    const response = await call("GET", "rest/account/export");

    expect(response.status).toBe(502);
    expect((await response.json()).code).toBe("BACKEND_UNAVAILABLE");
  });

  it("stops a read when the browser leaves, but never a write", async () => {
    const browserLeft = new AbortController();
    browserLeft.abort();

    await call("GET", "rest/account/export", { signal: browserLeft.signal });
    await call("POST", "rest/account/erase", {
      body: "{}",
      signal: browserLeft.signal,
    });

    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(false);
  });

  describe("erasing an account", () => {
    it("signs this browser out once the backend has erased the account", async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      const response = await call("POST", "rest/account/erase", {
        body: '{"confirmEmail":"a@example.com"}',
      });

      expect(response.status).toBe(204);
      expect(signOut).toHaveBeenCalledWith({ scope: "local" });
      expect(rememberSessionPreference).toHaveBeenCalledWith(false);
    });

    it("leaves the session alone when the backend refuses", async () => {
      fetchMock.mockResolvedValue(
        Response.json({ code: "ACCOUNT_AI_WORK_PENDING" }, { status: 409 }),
      );

      const response = await call("POST", "rest/account/erase", {
        body: '{"confirmEmail":"a@example.com"}',
      });

      expect(response.status).toBe(409);
      expect(signOut).not.toHaveBeenCalled();
    });

    it("allows only a handful of tries a minute from one caller", async () => {
      const headers = { "x-forwarded-for": "10.9.9.9" };
      const statuses = [];
      for (let attempt = 0; attempt < 6; attempt++) {
        const response = await call("POST", "rest/account/erase", {
          body: "{}",
          headers,
        });
        statuses.push(response.status);
      }

      expect(statuses.slice(0, 5).every((status) => status === 200)).toBe(true);
      expect(statuses[5]).toBe(429);
    });
  });
});
