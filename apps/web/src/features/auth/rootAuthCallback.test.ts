import { expect, it } from "vitest";
import { rootAuthCallback } from "./rootAuthCallback";

it("routes a Site URL fallback to the callback and retains the PKCE flow", () => {
  const callback = rootAuthCallback(
    new URL(
      "https://englow.example/?code=one-time&sb_flow_id=flow&tracking=ignored",
    ),
  );
  expect(callback?.pathname).toBe("/auth/callback");
  expect(callback?.searchParams.get("code")).toBe("one-time");
  expect(callback?.searchParams.get("sb_flow_id")).toBe("flow");
  expect(callback?.searchParams.has("tracking")).toBe(false);
});
it("preserves recovery token hashes and provider errors", () => {
  expect(
    rootAuthCallback(
      new URL("https://englow.example/?token_hash=token&type=recovery"),
    )?.searchParams.get("type"),
  ).toBe("recovery");
  expect(
    rootAuthCallback(new URL("https://englow.example/?error=access_denied"))
      ?.pathname,
  ).toBe("/auth/callback");
});
it.each([
  "/",
  "/?preview=brand",
  "/auth/callback?code=code",
  "/study?code=lesson",
])("does not intercept ordinary pages or loop at %s", (path) => {
  expect(rootAuthCallback(new URL(path, "https://englow.example"))).toBeNull();
});
