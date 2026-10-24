// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
const claims = vi.fn();
const getSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getClaims: claims, getSession },
  }),
}));
import { getServerSession } from "./getServerSession";
beforeEach(() => vi.clearAllMocks());
it("renders only a verified identity and the protected role claim", async () => {
  claims.mockResolvedValue({
    data: {
      claims: {
        sub: "u1",
        email: "test@example.com",
        app_metadata: { role: "STAFF" },
        user_metadata: { role: "ADMIN" },
      },
    },
    error: null,
  });
  expect(await getServerSession()).toEqual({
    userId: "u1",
    email: "test@example.com",
    role: "STAFF",
  });
  expect(getSession).not.toHaveBeenCalled();
});
it("cannot turn a tampered cookie into a signed-in server-rendered account", async () => {
  getSession.mockResolvedValue({
    data: {
      session: { user: { id: "forged", app_metadata: { role: "ADMIN" } } },
    },
  });
  claims.mockResolvedValue({ data: null, error: { code: "bad_jwt" } });
  expect(await getServerSession()).toBeNull();
});
it("returns guest when no session exists", async () => {
  claims.mockResolvedValue({ data: null, error: null });
  expect(await getServerSession()).toBeNull();
});
