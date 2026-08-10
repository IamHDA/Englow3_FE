import { isAuthRetryableFetchError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { safeRedirectPath } from "./safeRedirectPath";
import type { AuthErrorResult } from "./types";

export type OAuthProvider = "google" | "facebook";

export const oauthProviderLabels: Record<OAuthProvider, string> = {
  google: "Google",
  facebook: "Facebook",
};

/**
 * Supabase's own message is never shown — it names the provider config and
 * means nothing to a learner.
 */
export function oauthErrorResult(
  provider: OAuthProvider,
  code: string | undefined,
  retryable: boolean,
): AuthErrorResult {
  const label = oauthProviderLabels[provider];

  if (retryable) {
    return {
      status: "error",
      message: `Cannot reach ${label} right now. Check your connection and try again.`,
    };
  }

  switch (code) {
    case "provider_disabled":
    case "oauth_provider_not_supported":
      return {
        status: "error",
        message: `${label} sign-in is not enabled for this project.`,
      };

    case "user_banned":
      return { status: "error", message: "This account has been suspended." };

    case "over_request_rate_limit":
      return {
        status: "error",
        message: "Too many attempts. Wait a few minutes and try again.",
      };

    default:
      return {
        status: "error",
        message: `Could not start ${label} sign-in. Please try again.`,
      };
  }
}

/**
 * Hands the browser to the provider. On success this never returns — the page
 * navigates away — so only the failure path produces a result.
 */
export async function signInWithProvider(
  provider: OAuthProvider,
  next?: string,
): Promise<AuthErrorResult | undefined> {
  const supabase = getSupabaseBrowserClient();

  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", safeRedirectPath(next));

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback.toString() },
  });

  if (error) {
    return oauthErrorResult(
      provider,
      error.code,
      isAuthRetryableFetchError(error),
    );
  }

  return undefined;
}
