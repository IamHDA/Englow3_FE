import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

import { signInWithPassword, startOAuth } from "./authClient";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

describe("authClient", () => {
  it("posts to this app's own route with the header that marks it as ours", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ session: { userId: "u1", email: null, role: null } }),
    );

    const result = await signInWithPassword({
      email: "a@example.com",
      password: "pw",
      rememberMe: true,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(init.method).toBe("POST");
    expect(init.headers[CSRF_HEADER]).toBe(CSRF_VALUE);
    expect(init.credentials).toBe("same-origin");
    expect(JSON.parse(init.body)).toEqual({
      email: "a@example.com",
      password: "pw",
      rememberMe: true,
    });
    expect(result.error).toBeNull();
    expect(result).toMatchObject({ session: { userId: "u1" } });
  });

  it("hands back the code of a refusal", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { error: { code: "invalid_credentials", status: 400 } },
        { status: 400 },
      ),
    );

    const result = await signInWithPassword({
      email: "a@example.com",
      password: "pw",
      rememberMe: false,
    });

    expect(result.error).toEqual({ code: "invalid_credentials", status: 400 });
  });

  it("still reports a status when the answer is not JSON at all", async () => {
    fetchMock.mockResolvedValue(new Response("Bad Gateway", { status: 502 }));

    const result = await startOAuth("google");

    expect(result.error).toEqual({ status: 502 });
  });

  it("lets a network failure through for the caller's connection message", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(startOAuth("google")).rejects.toThrow("Failed to fetch");
  });
});
