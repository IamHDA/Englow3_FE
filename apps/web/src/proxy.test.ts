// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  claims: null as { sub: string } | null,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getClaims: async () => ({
        data: session.claims ? { claims: session.claims } : null,
      }),
    },
  }),
}));
vi.mock("@/server/serviceStatus", () => ({ probeServices: vi.fn() }));

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");

const { proxy } = await import("./proxy");

const event = { waitUntil: vi.fn() } as unknown as Parameters<typeof proxy>[1];

function visit(path: string) {
  return proxy(new NextRequest(`https://englow3.test${path}`), event);
}

beforeEach(() => {
  session.claims = null;
});

describe("pages that need an account", () => {
  it.each([
    "/friends",
    "/friends?tab=requests",
    "/people/67136874-3a1b-40fa-90c1-7411689b42e3",
    "/chat",
    "/chat/0b1b5d1e-7d6e-4a43-8a63-0c6f6b7f3f10",
    "/profile",
  ])(
    "sends a guest from %s to the login page, remembering where they were going",
    async (path) => {
      const response = await visit(path);

      expect(response.status).toBe(307);
      const location = new URL(response.headers.get("location") ?? "");
      expect(location.pathname).toBe("/auth/login");
      expect(location.searchParams.get("next")).toBe(path);
    },
  );

  it.each([
    "/friends",
    "/people/67136874-3a1b-40fa-90c1-7411689b42e3",
    "/chat",
    "/chat/0b1b5d1e-7d6e-4a43-8a63-0c6f6b7f3f10",
  ])("lets a signed-in account open %s", async (path) => {
    session.claims = { sub: "u1" };

    const response = await visit(path);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it.each(["/friendship-tips", "/chatter"])(
    "does not treat %s, which merely starts with the same letters, as member-only",
    async (path) => {
      const response = await visit(path);

      expect(response.headers.get("location")).toBeNull();
    },
  );
});
