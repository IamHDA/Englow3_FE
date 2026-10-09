// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: "the-token" } },
      }),
    },
  }),
}));

import { GET, POST, PUT } from "./route";

const fetchMock = vi.fn();
const UUID = "123e4567-e89b-12d3-a456-426614174000";

function call(
  method: string,
  headers: Record<string, string> = {},
  body?: string,
) {
  return new Request("https://englow.example/api/bff/rest/x", {
    method,
    headers: { host: "englow.example", [CSRF_HEADER]: CSRF_VALUE, ...headers },
    body,
  });
}

function params(path: string) {
  return { params: Promise.resolve({ path: path.split("/") }) };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(Response.json({ ok: true }));
});

afterEach(() => vi.unstubAllGlobals());

describe("/api/bff/rest", () => {
  it.each([
    ["GET", `admin/authoring/EXAM/${UUID}`],
    ["PUT", `admin/authoring/EXAM/${UUID}/content`],
    ["POST", `admin/authoring/DICTATION_LESSON/${UUID}/media`],
    ["POST", "admin/authoring/QUIZ"],
    ["POST", "admin/flashcards/import/validate"],
    ["POST", `admin/flashcards/sets/${UUID}/import`],
    ["POST", "admin/dictation/import"],
    ["POST", "admin/dictation/import/validate"],
  ])("passes %s %s on with the token added", async (method, path) => {
    const handler = { GET, POST, PUT }[method as "GET" | "POST" | "PUT"];

    const response = await handler(
      call(
        method,
        { "content-type": "application/json" },
        method === "GET" ? undefined : "{}",
      ),
      params(path),
    );

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`http://localhost:4000/rest/${path}`);
    expect(init.headers.authorization).toBe("Bearer the-token");
  });

  it.each([
    "admin/exams",
    "admin/authoring",
    "admin/authoring/exam/x",
    `admin/authoring/EXAM/${UUID}/../../../actuator`,
    "admin/dictation/import/extra",
    "learner/anything",
    "",
  ])("does not reach %j, which is not a path the screens use", async (path) => {
    const response = await POST(call("POST", {}, "{}"), params(path));

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a request another site could have caused", async () => {
    const response = await POST(
      call("POST", { origin: "https://evil.example" }, "{}"),
      params("admin/dictation/import"),
    );

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an unreachable BFF the way the screens already expect", async () => {
    fetchMock.mockRejectedValue(new Error("down"));

    const response = await POST(
      call("POST", {}, "{}"),
      params("admin/dictation/import"),
    );

    expect(response.status).toBe(502);
    expect((await response.json()).code).toBe("BACKEND_UNREACHABLE");
  });
});
