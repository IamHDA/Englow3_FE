import { isAuthRetryableFetchError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { safeRedirectPath } from "./safeRedirectPath";
import type { AuthErrorResult, AuthSubmitHandler } from "./types";

const CONFIRM_EMAIL_NOTICE =
  "Check your inbox to confirm your email address, then sign in.";

export function signUpErrorResult(
  code: string | undefined,
  retryable: boolean,
): AuthErrorResult {
  if (retryable) {
    return {
      status: "error",
      message:
        "Cannot reach the sign-up service. Check your connection and try again.",
    };
  }

  switch (code) {
    case "user_already_exists":
    case "email_exists":
      return {
        status: "error",
        fieldErrors: { email: "An account with this email already exists" },
      };

    case "weak_password":
      return {
        status: "error",
        fieldErrors: {
          password: "Choose a stronger password",
        },
      };

    case "email_address_invalid":
    case "validation_failed":
      return {
        status: "error",
        fieldErrors: { email: "Enter a valid email address" },
      };

    case "signup_disabled":
    case "email_provider_disabled":
      return {
        status: "error",
        message: "Sign-up is disabled for this project.",
      };

    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return {
        status: "error",
        message: "Too many attempts. Wait a few minutes and try again.",
      };

    default:
      return { status: "error", message: "Sign-up failed. Please try again." };
  }
}

export const signUp: AuthSubmitHandler = async ({ email, password }) => {
  const supabase = getSupabaseBrowserClient();

  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", safeRedirectPath(null));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callback.toString() },
  });

  if (error) {
    return signUpErrorResult(error.code, isAuthRetryableFetchError(error));
  }

  // With email confirmation enabled Supabase creates no session and, for an
  // address that already exists, returns an obfuscated user on purpose so the
  // form cannot be used to enumerate accounts. Both cases get the same notice.
  if (!data.session) {
    return { status: "notice", message: CONFIRM_EMAIL_NOTICE };
  }

  return { status: "success" };
};
