import { GraphQLError, type GraphQLFormattedError } from "graphql";

import { BackendError } from "../shared/http/backendError.js";

const STATUS_TO_CODE: Record<number, string> = {
  400: "BAD_USER_INPUT",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "BAD_USER_INPUT",
};

const SAFE_MESSAGES: Record<string, string> = {
  BAD_USER_INPUT: "The request was invalid",
  UNAUTHENTICATED: "Missing or invalid access token",
  FORBIDDEN: "You do not have permission to perform this action",
  NOT_FOUND: "The requested resource was not found",
  CONFLICT: "The request could not be completed due to a conflict",
  BACKEND_UNAVAILABLE: "The backend service is currently unavailable",
  INTERNAL_SERVER_ERROR: "An unexpected error occurred",
};

function codeForStatus(status: number): string {
  // status 0 = BackendClient never reached the backend (network/timeout).
  if (status === 0) return "BACKEND_UNAVAILABLE";
  return STATUS_TO_CODE[status] ?? "INTERNAL_SERVER_ERROR";
}

/**
 * Apollo's `formatError` hook, wired once in server.ts and api/index.ts. A
 * BackendError's `.message` and `.code` come straight from Spring Boot's
 * response body, so they never reach the client as-is - only the mapped
 * code, a fixed safe message, and the trace id for cross-system lookup.
 * Anything that isn't a BackendError (e.g. the UNAUTHENTICATED GraphQLError
 * thrown by ctx.requireToken()) is already safe and passes through unchanged.
 */
export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const original =
    error instanceof GraphQLError && error.originalError
      ? error.originalError
      : error;

  if (!(original instanceof BackendError)) {
    return formattedError;
  }

  const code = codeForStatus(original.status);
  return {
    message: SAFE_MESSAGES[code],
    extensions: { code, traceId: original.traceId },
  };
}
