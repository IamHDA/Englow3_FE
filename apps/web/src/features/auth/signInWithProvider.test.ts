import { describe, expect, it } from "vitest";

import { oauthErrorResult } from "./signInWithProvider";

describe("oauthErrorResult", () => {
  it("names the provider the user actually clicked", () => {
    expect(oauthErrorResult("google", "boom", false).message).toBe(
      "Could not start Google sign-in. Please try again.",
    );
    expect(oauthErrorResult("facebook", "boom", false).message).toBe(
      "Could not start Facebook sign-in. Please try again.",
    );
  });

  it("treats a retryable fetch failure as a connection problem", () => {
    expect(oauthErrorResult("facebook", undefined, true).message).toBe(
      "Cannot reach Facebook right now. Check your connection and try again.",
    );
  });

  it("explains a provider that is switched off", () => {
    for (const code of ["provider_disabled", "oauth_provider_not_supported"]) {
      expect(oauthErrorResult("google", code, false).message).toBe(
        "Google sign-in is not enabled for this project.",
      );
    }
  });

  it("explains a suspended account", () => {
    expect(oauthErrorResult("google", "user_banned", false).message).toBe(
      "This account has been suspended.",
    );
  });

  it("explains rate limiting", () => {
    expect(oauthErrorResult("google", "over_request_rate_limit", false).message).toBe(
      "Too many attempts. Wait a few minutes and try again.",
    );
  });

  it("never leaks the provider's own error text", () => {
    const result = oauthErrorResult("google", "unexpected_failure", false);
    expect(result.message).not.toMatch(/supabase|provider config|redirect_uri/i);
  });
});
