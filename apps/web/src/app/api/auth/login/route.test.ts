// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

const signInWithPassword = vi.fn();
const rememberSessionPreference = vi.fn();
const createClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async (options: unknown) => {
    createClient(options);
    return { auth: { signInWithPassword } };
  },
  rememberSessionPreference: (...args: unknown[]) =>
    rememberSessionPreference(...args),
}));

import { POST } from "./route";

function call(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://englow.example/api/auth/login", {
    method: "POST",
    headers: {
      host: "englow.example",
      "content-type": "application/json",
      [CSRF_HEADER]: CSRF_VALUE,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const credentials = { email: "a@example.com", password: "Secret123!" };

beforeEach(() => {
  signInWithPassword.mockReset();
  rememberSessionPreference.mockReset();
  createClient.mockReset();
});

describe("POST /api/auth/login", () => {
  it("answers with who signed in, never the token", async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "a@example.com",
          app_metadata: { role: "ADMIN" },
        },
        session: {
          access_token: "secret-token",
          refresh_token: "secret-refresh",
        },
      },
      error: null,
    });

    const response = await POST(call({ ...credentials, rememberMe: true }));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(JSON.parse(text)).toEqual({
      session: { userId: "u1", email: "a@example.com", role: "ADMIN" },
    });
    expect(text).not.toContain("secret-token");
    expect(text).not.toContain("secret-refresh");
  });

  it("ends the session with the browser unless remember me was ticked", async () => {
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: null });

    await POST(call({ ...credentials, rememberMe: false }));

    expect(rememberSessionPreference).toHaveBeenCalledWith(true);
    expect(createClient).toHaveBeenCalledWith({ sessionOnly: true });

    await POST(call({ ...credentials, rememberMe: true }));

    expect(rememberSessionPreference).toHaveBeenLastCalledWith(false);
    expect(createClient).toHaveBeenLastCalledWith({ sessionOnly: false });
  });

  it("reports a refusal by its code so the form can word it", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { code: "invalid_credentials", status: 400, name: "AuthApiError" },
    });

    const response = await POST(call({ ...credentials, rememberMe: false }));

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_credentials");
  });

  it("answers a provider outage inside the 4xx range, keeping its own status in the body", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: {
        code: "unexpected_failure",
        status: 502,
        name: "AuthRetryableFetchError",
      },
    });

    const response = await POST(call({ ...credentials, rememberMe: false }));

    expect(response.status).toBe(400);
    expect((await response.json()).error.status).toBe(502);
  });

  it("refuses a sign-in another site forced, before asking Supabase", async () => {
    const response = await POST(
      call(
        { ...credentials, rememberMe: false },
        { origin: "https://evil.example" },
      ),
    );

    expect(response.status).toBe(403);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects a body that is not a sign-in", async () => {
    const response = await POST(call({ email: 1 }));

    expect(response.status).toBe(400);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
