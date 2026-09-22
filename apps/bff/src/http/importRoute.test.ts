import express from "express";
import http, { type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";

import { importRoute } from "./importRoute.js";

let server: Server | undefined;

function start(): Promise<string> {
  const app = express();
  app.use("/rest", importRoute());

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server!.address() as AddressInfo;
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

/**
 * The test's own request, over raw http rather than fetch.
 *
 * fetch is what the route uses to reach the backend, and it is spied on here -
 * driving the test with the same function would have the spy record the test's
 * own calls and make every assertion about the backend wrong.
 */
function call(
  base: string,
  options: { token?: string; body?: string } = {},
): Promise<{ status: number; body: string }> {
  const url = new URL(`${base}/rest/admin/flashcards/import/validate`);

  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(options.token ? { authorization: options.token } : {}),
        },
      },
      (response) => {
        let body = "";
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () =>
          resolve({ status: response.statusCode ?? 0, body }),
        );
      },
    );
    request.on("error", reject);
    request.end(options.body ?? "[]");
  });
}

afterEach(() => {
  server?.close();
  server = undefined;
  vi.restoreAllMocks();
});

describe("POST /rest/admin/flashcards/import/validate", () => {
  // The backend decides who may import. This only checks that a token is
  // present at all - refusing here saves a round trip, and deciding here would
  // be a second place for the answer to be wrong.
  it("refuses without a token and does not call the backend", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const base = await start();

    const response = await call(base);

    expect(response.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("forwards the learner's token to the backend", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const base = await start();

    await call(base, { token: "Bearer token" });

    const forwarded = fetchSpy.mock.calls.at(-1);
    expect(String(forwarded?.[0])).toContain(
      "/api/admin/flashcards/import/validate",
    );
    expect(
      (forwarded?.[1]?.headers as Record<string, string>).authorization,
    ).toBe("Bearer token");
  });

  // The rejection report is the whole point of the endpoint. Summarising a
  // refusal here would lose the rows an author needs to go and fix.
  it("passes the backend's own body through on a refusal", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"code":"FLASHCARD_IMPORT_NOT_A_LIST"}', { status: 400 }),
    );
    const base = await start();

    const response = await call(base, { token: "Bearer token", body: "{}" });

    expect(response.status).toBe(400);
    expect(response.body).toContain("FLASHCARD_IMPORT_NOT_A_LIST");
  });

  it("says the backend is unreachable rather than failing silently", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    const base = await start();

    const response = await call(base, { token: "Bearer token" });

    expect(response.status).toBe(502);
  });
});
