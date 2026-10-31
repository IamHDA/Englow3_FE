import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

import type { AuthSession } from "../types";

/**
 * The shape `authErrorMessage` reads: Supabase's stable code, never its
 * English sentence.
 */
export type AuthApiError = { code?: string; status?: number; name?: string };

type Result<T> = ({ error: null } & T) | { error: AuthApiError };

/**
 * Talks to this app's own /api/auth routes. The browser holds no Supabase
 * session: the server keeps it in HttpOnly cookies and answers with what the
 * screen needs (who signed in, a link to go to, or the code of what failed).
 *
 * Resolves with `error` for a refusal the learner can act on, and rejects when
 * the server could not be reached at all - the callers already show a
 * connection message for that.
 */
async function post<T extends object>(
  path: string,
  body: Record<string, unknown>,
): Promise<Result<T>> {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      [CSRF_HEADER]: CSRF_VALUE,
    },
    body: JSON.stringify(body),
    credentials: "same-origin",
    signal: AbortSignal.timeout(20_000),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      error: {
        code: "AUTH_INVALID_RESPONSE",
        status: response.ok ? 502 : response.status,
      },
    };
  }
  if (!response.ok) {
    return {
      error: ("error" in payload ? (payload.error as AuthApiError) : null) ?? {
        status: response.status,
        ...("code" in payload && typeof payload.code === "string"
          ? { code: payload.code }
          : {}),
      },
    };
  }
  return { error: null, ...payload } as Result<T>;
}

export function signInWithPassword(values: {
  email: string;
  password: string;
  rememberMe: boolean;
}) {
  return post<{ session: AuthSession | null }>("login", values);
}

export function signUp(values: {
  email: string;
  password: string;
  fullName: string;
  displayName: string;
  birthDate: string;
  gender: string;
  acceptedTerms: boolean;
}) {
  return post<{ session: AuthSession | null }>("register", values);
}

export function signOutOfServer() {
  return post<object>("logout", {});
}

export function sendPasswordResetLink(email: string) {
  return post<object>("forgot", { email });
}

export function resendConfirmation(email: string) {
  return post<object>("resend", { email });
}

export function setNewPassword(password: string) {
  return post<object>("password", { password });
}

/** The provider's address to send the browser to; the server keeps the PKCE verifier. */
export function startOAuth(provider: "google" | "facebook") {
  return post<{ url: string }>("oauth", { provider });
}
