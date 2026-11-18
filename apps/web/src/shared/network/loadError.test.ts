import { CombinedGraphQLErrors } from "@apollo/client";
import { describe, expect, it } from "vitest";

import {
  backendCodeOf,
  errorCodeOf,
  hasBackendCode,
  isWellFormedId,
  loadErrorKind,
} from "./loadError";

function graphQLError(extensions: Record<string, unknown>) {
  return new CombinedGraphQLErrors({
    errors: [{ message: "failed", extensions }],
  });
}

describe("loadErrorKind", () => {
  it("reads a missing thing as not found", () => {
    expect(
      loadErrorKind(
        graphQLError({
          code: "NOT_FOUND",
          backendCode: "FLASHCARD_SET_NOT_FOUND",
        }),
      ),
    ).toBe("not-found");
  });

  /** "abc" in the address is not an id the backend could ever find. */
  it("reads a malformed id as not found", () => {
    expect(loadErrorKind(graphQLError({ code: "BAD_USER_INPUT" }))).toBe(
      "not-found",
    );
  });

  it("reads a server that did not answer as unavailable", () => {
    expect(loadErrorKind(graphQLError({ code: "BACKEND_UNAVAILABLE" }))).toBe(
      "unavailable",
    );
    expect(loadErrorKind(new Error("Failed to fetch"))).toBe("unavailable");
  });
});

describe("backendCodeOf and errorCodeOf", () => {
  /** Apollo Client 4 dropped `graphQLErrors`; the codes must still be found. */
  it("finds the codes on an Apollo Client 4 error", () => {
    const error = graphQLError({
      code: "FORBIDDEN",
      backendCode: "ACCESS_DENIED",
    });

    expect(backendCodeOf(error)).toBe("ACCESS_DENIED");
    expect(errorCodeOf(error)).toBe("FORBIDDEN");
  });

  it("finds nothing on an error that did not come from the BFF", () => {
    expect(backendCodeOf(new Error("Failed to fetch"))).toBeNull();
    expect(errorCodeOf(undefined)).toBeNull();
  });
});

describe("hasBackendCode", () => {
  it("finds the code on any error of the response, not only the first", () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        { message: "a", extensions: { backendCode: "SOMETHING_ELSE" } },
        { message: "b", extensions: { backendCode: "USER_NOT_FOUND" } },
      ],
    });

    expect(hasBackendCode(error, "USER_NOT_FOUND")).toBe(true);
    expect(backendCodeOf(error)).toBe("SOMETHING_ELSE");
  });

  it("is false for another code, no error, or an error from outside the BFF", () => {
    expect(
      hasBackendCode(graphQLError({ backendCode: "A" }), "USER_NOT_FOUND"),
    ).toBe(false);
    expect(hasBackendCode(undefined, "USER_NOT_FOUND")).toBe(false);
    expect(hasBackendCode(new Error("Failed to fetch"), "X")).toBe(false);
  });
});

describe("isWellFormedId", () => {
  it("accepts a UUID and nothing else", () => {
    expect(isWellFormedId("67136874-3a1b-40fa-90c1-7411689b42e3")).toBe(true);
    expect(isWellFormedId("abc")).toBe(false);
    expect(isWellFormedId("core-vocabulary-a1")).toBe(false);
  });
});
