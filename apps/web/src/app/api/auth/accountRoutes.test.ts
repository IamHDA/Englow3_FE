// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";
const api = vi.hoisted(() => ({
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  resend: vi.fn(),
  signOut: vi.fn(),
  remember: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: api }),
  rememberSessionPreference: api.remember,
}));
import { POST as register } from "./register/route";
import { POST as forgot } from "./forgot/route";
import { POST as password } from "./password/route";
import { POST as resend } from "./resend/route";
import { POST as logout } from "./logout/route";
const body = {
  email: "test@example.com",
  password: "SafePassword@",
  fullName: "Test User",
  displayName: "tester",
  birthDate: "2000-02-29",
  gender: "OTHER",
  acceptedTerms: true,
};
function request(value: unknown, extra: Record<string, string> = {}) {
  return new Request("https://englow.example/api/auth/test", {
    method: "POST",
    headers: {
      host: "englow.example",
      origin: "https://englow.example",
      [CSRF_HEADER]: CSRF_VALUE,
      "content-type": "application/json",
      "x-forwarded-for": crypto.randomUUID(),
      ...extra,
    },
    body: JSON.stringify(value),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  api.signUp.mockResolvedValue({
    data: { user: { id: "new" }, session: null },
    error: null,
  });
  for (const call of [
    api.resetPasswordForEmail,
    api.updateUser,
    api.resend,
    api.signOut,
  ])
    call.mockResolvedValue({ error: null });
});
it("registers normalized data without allowing role escalation in user metadata", async () => {
  const response = await register(
    request({ ...body, email: " test@example.com ", role: "ADMIN" }),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ session: null });
  expect(api.signUp.mock.calls[0][0].options.data).not.toHaveProperty("role");
  expect(api.signUp.mock.calls[0][0].email).toBe("test@example.com");
});
it("supports registration with confirmation disabled without exposing tokens", async () => {
  api.signUp.mockResolvedValue({
    data: {
      user: { id: "new", email: body.email, app_metadata: {} },
      session: {
        access_token: "PRIVATE_ACCESS_TOKEN",
        refresh_token: "PRIVATE_REFRESH_TOKEN",
      },
    },
    error: null,
  });
  const response = await register(request(body));
  const result = await response.text();
  expect(JSON.parse(result).session.userId).toBe("new");
  expect(result).not.toContain("PRIVATE_");
});
it.each([
  { acceptedTerms: false },
  { acceptedTerms: undefined },
  { birthDate: "2000-02-30" },
  { birthDate: "2999-01-01" },
  { email: "bad" },
  { password: "weak" },
  { fullName: " " },
  { displayName: "a b" },
  { gender: "INVALID" },
])("rejects invalid registration before calling Auth: %j", async (override) => {
  expect((await register(request({ ...body, ...override }))).status).toBe(400);
  expect(api.signUp).not.toHaveBeenCalled();
});
it("uses this deployment's callback for password-reset email", async () => {
  expect((await forgot(request({ email: " test@example.com " }))).status).toBe(
    200,
  );
  expect(api.resetPasswordForEmail).toHaveBeenCalledWith(body.email, {
    redirectTo: "https://englow.example/auth/callback",
  });
});
it("keeps the allowlisted testing callback when the server URL is internal", async () => {
  const response = await forgot(
    new Request("http://localhost:3000/api/auth/forgot", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        "x-forwarded-host": "englow3-web-test.vercel.app",
        origin: "https://englow3-web-test.vercel.app",
        [CSRF_HEADER]: CSRF_VALUE,
        "content-type": "application/json",
        "x-forwarded-for": crypto.randomUUID(),
      },
      body: JSON.stringify({ email: body.email }),
    }),
  );
  expect(response.status).toBe(200);
  expect(api.resetPasswordForEmail).toHaveBeenCalledWith(body.email, {
    redirectTo: "https://englow3-web-test.vercel.app/auth/callback",
  });
});
it("rejects weak password changes before touching the signed-in account", async () => {
  expect((await password(request({ password: "weak" }))).status).toBe(400);
  expect(api.updateUser).not.toHaveBeenCalled();
});
it("retains a missing-session error so recovery can be offered", async () => {
  api.updateUser.mockResolvedValue({
    error: { name: "AuthSessionMissingError", status: 400 },
  });
  expect(
    (await (await password(request({ password: body.password }))).json()).error
      .name,
  ).toBe("AuthSessionMissingError");
});
it("resends confirmation with the correct callback", async () => {
  expect((await resend(request({ email: body.email }))).status).toBe(200);
  expect(api.resend).toHaveBeenCalledWith({
    type: "signup",
    email: body.email,
    options: { emailRedirectTo: "https://englow.example/auth/callback" },
  });
});
it("does not change remember-me preference on failed logout", async () => {
  api.signOut.mockResolvedValue({ error: { status: 503 } });
  await logout(request({}));
  expect(api.remember).not.toHaveBeenCalled();
});
it("signs out locally and clears the preference on success", async () => {
  expect((await logout(request({}))).status).toBe(200);
  expect(api.signOut).toHaveBeenCalledWith({ scope: "local" });
  expect(api.remember).toHaveBeenCalledWith(false);
});
it.each([register, forgot, password, resend, logout])(
  "refuses a cross-site account mutation",
  async (route) => {
    expect(
      (await route(request(body, { origin: "https://evil.example" }))).status,
    ).toBe(403);
  },
);
