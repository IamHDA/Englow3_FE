import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";

import { formatError } from "./errors.js";
import { BackendError } from "../shared/http/backendError.js";

describe("formatError", () => {
  it("maps a 401 BackendError to UNAUTHENTICATED without leaking the backend message", () => {
    const backendError = new BackendError(
      "some internal detail from Spring Boot",
      401,
      "AUTH_MISSING",
      "trace-1",
    );
    const original = new GraphQLError("wrapped", {
      originalError: backendError,
    });

    const result = formatError(
      { message: "wrapped", extensions: {} },
      original,
    );

    expect(result.message).toBe("Missing or invalid access token");
    expect(result.message).not.toContain("Spring Boot");
    expect(result.extensions).toEqual({
      code: "UNAUTHENTICATED",
      backendCode: "AUTH_MISSING",
      traceId: "trace-1",
    });
  });

  it("passes the backend's domain code through as backendCode without its message", () => {
    const backendError = new BackendError(
      "Section scores total 195 but the paper declares 200",
      409,
      "EXAM_SCORE_MISMATCH",
      "trace-2",
    );
    const original = new GraphQLError("wrapped", {
      originalError: backendError,
    });

    const result = formatError(
      { message: "wrapped", extensions: {} },
      original,
    );

    expect(result.message).toBe(
      "The request could not be completed due to a conflict",
    );
    expect(result.message).not.toContain("195");
    expect(result.extensions).toEqual({
      code: "CONFLICT",
      backendCode: "EXAM_SCORE_MISMATCH",
      traceId: "trace-2",
    });
  });

  it("maps a 500 BackendError to a generic internal error, not a passthrough", () => {
    const backendError = new BackendError(
      "NullPointerException at com.englow3.UserService.findById",
      500,
    );
    const original = new GraphQLError("wrapped", {
      originalError: backendError,
    });

    const result = formatError(
      { message: "wrapped", extensions: {} },
      original,
    );

    expect(result.message).toBe("An unexpected error occurred");
    expect(result.message).not.toContain("NullPointerException");
    expect(result.extensions).toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  it("maps a network-level failure (status 0) to BACKEND_UNAVAILABLE", () => {
    const backendError = new BackendError(
      "Failed to reach the backend service",
      0,
    );
    const original = new GraphQLError("wrapped", {
      originalError: backendError,
    });

    const result = formatError(
      { message: "wrapped", extensions: {} },
      original,
    );

    expect(result.extensions).toMatchObject({ code: "BACKEND_UNAVAILABLE" });
  });

  it("passes through errors that are not BackendError unchanged", () => {
    const formatted = {
      message: "Missing or invalid access token",
      extensions: { code: "UNAUTHENTICATED" },
    };
    const original = new GraphQLError("Missing or invalid access token", {
      extensions: { code: "UNAUTHENTICATED" },
    });

    const result = formatError(formatted, original);

    expect(result).toBe(formatted);
  });
});
