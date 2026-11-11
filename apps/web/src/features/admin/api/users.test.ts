import { afterEach, expect, it, vi } from "vitest";
import { changeUserRole, UserAdminError } from "./users";
import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";
afterEach(() => vi.unstubAllGlobals());
const user = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "editor@example.com",
  displayName: "Editor",
  role: "LEARNER" as const,
};
it("sends the expected role and CSRF header with a role change", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ ...user, role: "STAFF" }), { status: 200 }),
    );
  vi.stubGlobal("fetch", fetcher);
  await changeUserRole(user, "STAFF", "Assign editor");
  const options = fetcher.mock.calls[0][1];
  expect(options.headers[CSRF_HEADER]).toBe(CSRF_VALUE);
  expect(options.credentials).toBe("same-origin");
  expect(JSON.parse(options.body)).toEqual({
    expectedRole: "LEARNER",
    role: "STAFF",
    reason: "Assign editor",
  });
});
it("retains the stale-update code so the UI can request a reload", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response('{"code":"USER_ROLE_CHANGED"}', { status: 409 }),
      ),
  );
  await expect(changeUserRole(user, "STAFF", "Assign editor")).rejects.toEqual(
    new UserAdminError("USER_ROLE_CHANGED"),
  );
});
