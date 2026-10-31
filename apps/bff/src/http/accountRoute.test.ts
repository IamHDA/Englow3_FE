import express from "express";
import http, { type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";

import { accountRoute } from "./accountRoute.js";

let server: Server | undefined;

const BACKEND = "http://backend.test";

function start(fetcher: typeof fetch): Promise<string> {
  const app = express();
  app.use("/rest", accountRoute(BACKEND, fetcher));
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server!.address() as AddressInfo;
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

/** The test's own request, over raw http: fetch is the thing the route calls and the spy would record this too. */
function call(
  base: string,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {},
): Promise<{ status: number; body: string }> {
  const url = new URL(`${base}/rest${path}`);
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method,
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
    if (options.body !== undefined) request.write(JSON.stringify(options.body));
    request.end();
  });
}

function backendAnswering(status: number, body = "") {
  return vi.fn(
    async () =>
      new Response(status === 204 ? null : body, {
        status,
        headers: { "content-type": "application/json" },
      }),
  ) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

afterEach(() => {
  server?.close();
  server = undefined;
});

describe("account route", () => {
  it("serves the price list to a visitor with no token", async () => {
    const fetcher = backendAnswering(200, '[{"code":"FREE"}]');
    const base = await start(fetcher);

    const result = await call(base, "GET", "/plans");

    expect(result.status).toBe(200);
    expect(result.body).toBe('[{"code":"FREE"}]');
    const [url, init] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(`${BACKEND}/api/plans`);
    expect((init as RequestInit).headers).not.toHaveProperty("authorization");
  });

  it.each([
    ["GET", "/account/subscription"],
    ["GET", "/account/export"],
    ["POST", "/account/erase"],
  ])("turns away %s %s without a bearer token", async (method, path) => {
    const fetcher = backendAnswering(200);
    const base = await start(fetcher);

    const result = await call(base, method, path, {
      body: { confirmEmail: "a@b.co" },
    });

    expect(result.status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("passes the caller's token on when exporting", async () => {
    const fetcher = backendAnswering(200, '{"account":[]}');
    const base = await start(fetcher);

    const result = await call(base, "GET", "/account/export", {
      token: "Bearer abc",
    });

    expect(result.status).toBe(200);
    const [url, init] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(`${BACKEND}/api/user/me/export`);
    expect((init as RequestInit).headers).toMatchObject({
      authorization: "Bearer abc",
    });
  });

  it("sends only the confirmation email to the backend when erasing", async () => {
    const fetcher = backendAnswering(204);
    const base = await start(fetcher);

    const result = await call(base, "POST", "/account/erase", {
      token: "Bearer abc",
      body: { confirmEmail: "me@example.com", extra: "ignored" },
    });

    expect(result.status).toBe(204);
    const [url, init] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(`${BACKEND}/api/user/me/erase`);
    expect((init as RequestInit).body).toBe(
      JSON.stringify({ confirmEmail: "me@example.com" }),
    );
  });

  it.each([{}, { confirmEmail: "" }, { confirmEmail: 42 }])(
    "refuses an erase request with no usable confirmation (%j)",
    async (body) => {
      const fetcher = backendAnswering(204);
      const base = await start(fetcher);

      const result = await call(base, "POST", "/account/erase", {
        token: "Bearer abc",
        body,
      });

      expect(result.status).toBe(400);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it("hands back the backend's refusal unchanged", async () => {
    const fetcher = backendAnswering(409, '{"code":"ACCOUNT_AI_WORK_PENDING"}');
    const base = await start(fetcher);

    const result = await call(base, "POST", "/account/erase", {
      token: "Bearer abc",
      body: { confirmEmail: "me@example.com" },
    });

    expect(result.status).toBe(409);
    expect(result.body).toContain("ACCOUNT_AI_WORK_PENDING");
  });

  it("answers 502 when the backend cannot be reached", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("down");
    }) as unknown as typeof fetch;
    const base = await start(fetcher);

    const result = await call(base, "GET", "/plans");

    expect(result.status).toBe(502);
    expect(result.body).toContain("BACKEND_UNAVAILABLE");
  });
});

describe("administrator plan routes", () => {
  it("passes a well-formed grant to the backend with the caller's token", async () => {
    const fetcher = backendAnswering(204);
    const base = await start(fetcher);

    const result = await call(base, "PUT", "/admin/subscriptions", {
      token: "Bearer admin",
      body: { email: " a@b.co ", billingPeriod: "MONTHLY", days: 30 },
    });

    expect(result.status).toBe(204);
    const [url, init] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(`${BACKEND}/api/admin/subscriptions`);
    expect((init as RequestInit).method).toBe("PUT");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      email: "a@b.co",
      billingPeriod: "MONTHLY",
      days: 30,
    });
  });

  it.each([
    { email: "a@b.co", billingPeriod: "WEEKLY", days: 30 },
    { email: "a@b.co", billingPeriod: "MONTHLY", days: 0 },
    { email: "a@b.co", billingPeriod: "MONTHLY", days: 99999 },
    { email: "a@b.co", billingPeriod: "MONTHLY", days: 1.5 },
    { email: "", billingPeriod: "MONTHLY", days: 30 },
  ])("refuses a malformed grant (%j)", async (body) => {
    const fetcher = backendAnswering(204);
    const base = await start(fetcher);

    const result = await call(base, "PUT", "/admin/subscriptions", {
      token: "Bearer admin",
      body,
    });

    expect(result.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("revokes by sending the email to the backend's DELETE", async () => {
    const fetcher = backendAnswering(204);
    const base = await start(fetcher);

    const result = await call(base, "POST", "/admin/subscriptions/revoke", {
      token: "Bearer admin",
      body: { email: "a@b.co" },
    });

    expect(result.status).toBe(204);
    const [url, init] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(`${BACKEND}/api/admin/subscriptions?email=a%40b.co`);
    expect((init as RequestInit).method).toBe("DELETE");
  });

  it("turns away a request with no token", async () => {
    const fetcher = backendAnswering(204);
    const base = await start(fetcher);

    const result = await call(base, "PUT", "/admin/subscriptions", {
      body: { email: "a@b.co", billingPeriod: "MONTHLY", days: 30 },
    });

    expect(result.status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
