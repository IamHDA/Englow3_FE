// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
const exchange = vi.fn();
const verify = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { exchangeCodeForSession: exchange, verifyOtp: verify },
  }),
}));
import { GET } from "./route";
const success = (role = "LEARNER") => ({
  data: { user: { id: "u1", app_metadata: { role } } },
  error: null,
});
const request = (query: string) =>
  new Request("https://englow.example/auth/callback?" + query);
beforeEach(() => {
  vi.resetAllMocks();
  exchange.mockResolvedValue(success());
  verify.mockResolvedValue(success());
});
it.each([
  ["LEARNER", "/"],
  ["ADMIN", "/admin"],
  ["STAFF", "/admin"],
])("finishes PKCE for %s in the right role home", async (role, home) => {
  exchange.mockResolvedValue(success(role));
  const response = await GET(request("code=pkce-code"));
  expect(response.headers.get("location")).toBe(
    "https://englow.example" + home,
  );
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("referrer-policy")).toBe("no-referrer");
});
it("accepts an email token hash without a browser PKCE verifier", async () => {
  const response = await GET(request("token_hash=one-time-token&type=email"));
  expect(verify).toHaveBeenCalledWith({
    token_hash: "one-time-token",
    type: "email",
  });
  expect(exchange).not.toHaveBeenCalled();
  expect(response.headers.get("location")).toBe("https://englow.example/");
});
it("sends recovery verification to reset even for a staff account", async () => {
  verify.mockResolvedValue(success("STAFF"));
  const response = await GET(
    request("token_hash=recovery-token&type=recovery"),
  );
  expect(response.headers.get("location")).toBe(
    "https://englow.example/auth/reset",
  );
});
it("uses the SDK recovery marker when Supabase fell back to the root URL", async () => {
  exchange.mockResolvedValue({
    ...success("STAFF"),
    data: { ...success("STAFF").data, redirectType: "recovery" },
  });
  const response = await GET(request("code=recovery-code&sb_flow_id=flow"));
  expect(exchange).toHaveBeenCalledWith("recovery-code", { flowId: "flow" });
  expect(response.headers.get("location")).toBe(
    "https://englow.example/auth/reset",
  );
});
it("offers another reset link for expired recovery tokens", async () => {
  exchange.mockResolvedValue({
    data: { user: null },
    error: { code: "otp_expired" },
  });
  expect(
    (await GET(request("code=expired&next=/auth/reset"))).headers.get(
      "location",
    ),
  ).toBe("https://englow.example/auth/forgot?expired=1");
});
it("contains interrupted exchanges and does not expose the provider error", async () => {
  exchange.mockRejectedValue(new Error("private provider details"));
  const response = await GET(request("code=broken"));
  expect(response.headers.get("location")).toBe(
    "https://englow.example/auth/error",
  );
});
it("does not verify unsupported OTP types or provider cancellations", async () => {
  await GET(request("token_hash=x&type=sms"));
  await GET(request("code=x&error=access_denied"));
  expect(verify).not.toHaveBeenCalled();
  expect(exchange).not.toHaveBeenCalled();
});
it.each(["https://evil.example", "//evil.example", "/\\evil.example"])(
  "refuses an external next path %s",
  async (next) => {
    const response = await GET(
      request("code=ok&next=" + encodeURIComponent(next)),
    );
    expect(new URL(response.headers.get("location")!).origin).toBe(
      "https://englow.example",
    );
  },
);
