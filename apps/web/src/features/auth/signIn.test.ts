import { describe, expect, it } from "vitest";

import { signInErrorResult } from "./signIn";

describe("signInErrorResult", () => {
  it("treats a retryable fetch failure as a connection problem, whatever the code", () => {
    const result = signInErrorResult(undefined, true);
    expect(result).toEqual({
      status: "error",
      message: "Cannot reach the sign-in service. Check your connection and try again.",
    });
  });

  it("keeps bad credentials at form level rather than blaming the password", () => {
    const result = signInErrorResult("invalid_credentials", false);
    expect(result).toEqual({
      status: "error",
      message: "Email or password is incorrect.",
    });
  });

  it("pins a rejected email onto the email field", () => {
    for (const code of ["email_address_invalid", "validation_failed"]) {
      expect(signInErrorResult(code, false)).toEqual({
        status: "error",
        fieldErrors: { email: "Enter a valid email address" },
      });
    }
  });

  it("explains an unconfirmed email", () => {
    expect(signInErrorResult("email_not_confirmed", false).message).toBe(
      "Confirm your email address before signing in.",
    );
  });

  it("explains a suspended account", () => {
    expect(signInErrorResult("user_banned", false).message).toBe(
      "This account has been suspended.",
    );
  });

  it("explains rate limiting", () => {
    expect(signInErrorResult("over_request_rate_limit", false).message).toBe(
      "Too many attempts. Wait a few minutes and try again.",
    );
  });

  it("explains a disabled email provider", () => {
    for (const code of [
      "email_provider_disabled",
      "provider_disabled",
      "signup_disabled",
    ]) {
      expect(signInErrorResult(code, false).message).toBe(
        "Email sign-in is disabled for this project.",
      );
    }
  });

  it("falls back to a generic message for an unknown code", () => {
    expect(signInErrorResult("some_future_code", false).message).toBe(
      "Sign-in failed. Please try again.",
    );
    expect(signInErrorResult(undefined, false).message).toBe(
      "Sign-in failed. Please try again.",
    );
  });
});
