import { isAuthRetryableFetchError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type { LoginErrorResult, LoginSubmitHandler } from "./types";

/**
 * Turns a Supabase auth error into something the form can show. Supabase
 * messages are never rendered directly — they are English, change between
 * releases, and `invalid_credentials` deliberately does not say which of the
 * two fields was wrong, so it stays a form-level message rather than being
 * pinned on the password.
 *
 * Split out from the call itself so it can be tested without a network.
 */
export function signInErrorResult(
  code: string | undefined,
  retryable: boolean,
): LoginErrorResult {
  if (retryable) {
    return {
      status: "error",
      message: "Cannot reach the sign-in service. Check your connection and try again.",
    };
  }

  switch (code) {
    case "invalid_credentials":
      return { status: "error", message: "Email or password is incorrect." };

    case "email_not_confirmed":
      return {
        status: "error",
        message: "Confirm your email address before signing in.",
      };

    case "user_banned":
      return { status: "error", message: "This account has been suspended." };

    case "over_request_rate_limit":
      return {
        status: "error",
        message: "Too many attempts. Wait a few minutes and try again.",
      };

    case "email_address_invalid":
    case "validation_failed":
      return {
        status: "error",
        fieldErrors: { email: "Enter a valid email address" },
      };

    case "email_provider_disabled":
    case "provider_disabled":
    case "signup_disabled":
      return {
        status: "error",
        message: "Email sign-in is disabled for this project.",
      };

    default:
      return { status: "error", message: "Sign-in failed. Please try again." };
  }
}

export const signIn: LoginSubmitHandler = async ({ email, password }) => {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return signInErrorResult(error.code, isAuthRetryableFetchError(error));
  }

  return { status: "success" };
};

export async function signOut() {
  await getSupabaseBrowserClient().auth.signOut();
}
