import { stringToBase64URL } from "@supabase/ssr";
import { describe, expect, it } from "vitest";

import {
  REVOKED_SESSION_COOKIE,
  revokedAuthCookieNames,
  sessionIdOf,
} from "./revokedSession";

const AUTH = "sb-project-auth-token";

/** An auth cookie value the way @supabase/ssr writes it. */
function authValue(sessionId: string): string {
  const claims = stringToBase64URL(JSON.stringify({ session_id: sessionId }));
  const session = { access_token: `header.${claims}.signature` };
  return `base64-${stringToBase64URL(JSON.stringify(session))}`;
}

describe("sessionIdOf", () => {
  it("reads the session id from the access token in the auth cookie", () => {
    expect(sessionIdOf([{ name: AUTH, value: authValue("s1") }])).toBe("s1");
  });

  it("puts a chunked cookie back together in order", () => {
    const value = authValue("s1");
    const cut = Math.floor(value.length / 2);

    expect(
      sessionIdOf([
        { name: `${AUTH}.1`, value: value.slice(cut) },
        { name: `${AUTH}.0`, value: value.slice(0, cut) },
      ]),
    ).toBe("s1");
  });

  it("is null without a session, or with one it cannot read", () => {
    expect(sessionIdOf([])).toBeNull();
    expect(sessionIdOf([{ name: AUTH, value: "base64-not-json" }])).toBeNull();
  });
});

describe("revokedAuthCookieNames", () => {
  it("drops the session this browser signed out of", () => {
    expect(
      revokedAuthCookieNames([
        { name: AUTH, value: authValue("s1") },
        { name: REVOKED_SESSION_COOKIE, value: "s1" },
        { name: "unrelated", value: "x" },
      ]),
    ).toEqual([AUTH]);
  });

  it("keeps a new sign-in made after signing out", () => {
    expect(
      revokedAuthCookieNames([
        { name: AUTH, value: authValue("s2") },
        { name: REVOKED_SESSION_COOKIE, value: "s1" },
      ]),
    ).toEqual([]);
  });

  it("keeps the session when nothing was signed out", () => {
    expect(
      revokedAuthCookieNames([{ name: AUTH, value: authValue("s1") }]),
    ).toEqual([]);
  });
});
