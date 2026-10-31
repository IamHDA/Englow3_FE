// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

const signOut = vi.fn();
const rememberSessionPreference = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: { signOut } }),
  rememberSessionPreference: (...args: unknown[]) =>
    rememberSessionPreference(...args),
}));

const forwardToBff = vi.fn();
vi.mock("@/server/bff", () => ({
  bffRestUrl: "http://bff.test/rest",
  forwardToBff: (...args: unknown[]) => forwardToBff(...args),
}));

import { POST } from "./route";

function call(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://englow.example/api/account/erase", {
    method: "POST",
    headers: {
      host: "englow.example",
      "content-type": "application/json",
      "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}`,
      [CSRF_HEADER]: CSRF_VALUE,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  signOut.mockReset().mockResolvedValue({ error: null });
  rememberSessionPreference.mockReset();
  forwardToBff.mockReset();
});

describe("POST /api/account/erase", () => {
  it("refuses a request another site could have caused, before asking the backend", async () => {
    const response = await POST(
      call({ confirmEmail: "a@example.com" }, { [CSRF_HEADER]: "" }),
    );

    expect(response.status).toBe(403);
    expect(forwardToBff).not.toHaveBeenCalled();
  });

  it.each([{}, { confirmEmail: "" }, { confirmEmail: 7 }])(
    "refuses a body with no usable confirmation (%j)",
    async (body) => {
      const response = await POST(call(body));

      expect(response.status).toBe(400);
      expect(forwardToBff).not.toHaveBeenCalled();
    },
  );

  it("signs this browser out once the backend has erased the account", async () => {
    forwardToBff.mockResolvedValue(new Response(null, { status: 204 }));

    const response = await POST(call({ confirmEmail: " a@example.com " }));

    expect(response.status).toBe(204);
    const [url, init] = forwardToBff.mock.calls[0];
    expect(url).toBe("http://bff.test/rest/account/erase");
    expect(JSON.parse(init.body)).toEqual({ confirmEmail: "a@example.com" });
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("leaves the session alone when the backend refuses", async () => {
    forwardToBff.mockResolvedValue(
      Response.json({ code: "ACCOUNT_AI_WORK_PENDING" }, { status: 409 }),
    );

    const response = await POST(call({ confirmEmail: "a@example.com" }));

    expect(response.status).toBe(409);
    expect(signOut).not.toHaveBeenCalled();
  });
});
