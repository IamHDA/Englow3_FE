import express from "express";
import http, { type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authoringRoute } from "./authoringRoute.js";
let server: Server | undefined;
async function call(
  path: string,
  options: {
    token?: string;
    body?: string;
    method?: string;
    contentType?: string;
  } = {},
) {
  const app = express();
  app.use("/rest", authoringRoute());
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  return new Promise<{ status: number; body: string }>((resolve, reject) => {
    const request = http.request(
      {
        hostname: "127.0.0.1",
        port: (server!.address() as AddressInfo).port,
        path: "/rest/admin/authoring/" + path,
        method: options.method ?? "POST",
        headers: {
          "content-type": options.contentType ?? "application/json",
          ...(options.token ? { authorization: options.token } : {}),
        },
      },
      (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () =>
          resolve({ status: response.statusCode!, body }),
        );
      },
    );
    request.on("error", reject);
    request.end(options.body ?? "{}");
  });
}
afterEach(() => {
  server?.close();
  server = undefined;
  vi.restoreAllMocks();
});
describe("structured authoring REST boundary", () => {
  it("forwards flashcard audio as multipart to its own module", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          '{"objectKey":"flashcards/authoring/file.wav","url":"http://media/file"}',
          { status: 200 },
        ),
      );
    const result = await call(
      "FLASHCARD_SET/00000000-0000-0000-0000-000000000000/media",
      { token: "Bearer test", body: "RIFF1234WAVE", contentType: "audio/wav" },
    );
    expect(result.status).toBe(200);
    expect(String(fetch.mock.calls[0][0])).toContain(
      "/api/admin/flashcards/media",
    );
    const form = fetch.mock.calls[0][1]?.body as FormData;
    expect(form.get("file")).toBeInstanceOf(Blob);
  });
  it("refuses an unauthenticated edit without reaching the backend", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    expect((await call("QUIZ")).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("only forwards known module paths and preserves the optimistic version", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response('{"version":9}', { status: 200 }));
    const id = "10000000-0000-0000-0000-000000000001";
    expect(
      (
        await call("QUIZ/" + id, {
          token: "Bearer test",
          method: "PUT",
          body: '{"version":8,"content":{"questions":[]}}',
        })
      ).status,
    ).toBe(200);
    expect(String(fetch.mock.calls[0][0])).toContain(
      "/api/admin/quizzes/" + id + "/authoring",
    );
    expect(fetch.mock.calls[0][1]?.body).toBe(
      '{"version":8,"content":{"questions":[]}}',
    );
  });
  it("does not expose backend failure bodies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("private database diagnostics", { status: 500 }),
    );
    const result = await call("EXAM", { token: "Bearer test" });
    expect(result.status).toBe(500);
    expect(result.body).toContain("BACKEND_UNAVAILABLE");
    expect(result.body).not.toContain("private database diagnostics");
  });
  it("returns structured validation for malformed JSON", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const result = await call("QUIZ", {
      token: "Bearer test",
      body: "{broken",
    });
    expect(result.status).toBe(400);
    expect(JSON.parse(result.body).code).toBe("INVALID_JSON");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects a route that could be used as an arbitrary backend proxy", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    expect((await call("USERS", { token: "Bearer test" })).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });
});
