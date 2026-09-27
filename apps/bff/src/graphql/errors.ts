import type { ApolloServerPlugin } from "@apollo/server";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError, type GraphQLFormattedError } from "graphql";

import type { GraphQLContext } from "./context.js";
import { BackendError } from "../shared/http/backendError.js";
import { logServerError } from "../shared/http/logServerError.js";

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

/**
 * The codes whose message a client may read: Apollo's own (a query that does not
 * parse or validate, a variable of the wrong shape - all of it about the
 * caller's request, none of it about this server) and the two this BFF throws
 * itself. INTERNAL_SERVER_ERROR is left out on purpose: it is what Apollo files
 * an error under when nobody classified it, and that is what must not pass.
 */
const CLIENT_CODES = new Set<string>([
  ...Object.values(ApolloServerErrorCode).filter(
    (code) => code !== ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
  ),
  "UNAUTHENTICATED",
  "FORBIDDEN",
]);

function codeForStatus(status: number): string {
  // status 0 = BackendClient never reached the backend (network/timeout).
  if (status === 0) return "BACKEND_UNAVAILABLE";
  return STATUS_TO_CODE[status] ?? "INTERNAL_SERVER_ERROR";
}

function unwrap(error: unknown): unknown {
  return error instanceof GraphQLError && error.originalError
    ? error.originalError
    : error;
}

/** The code the client is shown - what `formatError` and the log both go by. */
function publicCode(original: unknown, declared: unknown): string {
  if (original instanceof BackendError) return codeForStatus(original.status);
  return typeof declared === "string" && CLIENT_CODES.has(declared)
    ? declared
    : "INTERNAL_SERVER_ERROR";
}

/**
 * Apollo's `formatError` hook, wired once in app.ts. Only an allow-listed error
 * reaches the client as it is. A BackendError's `.message` comes straight from
 * Spring Boot's response body, so it never does - only the mapped code, a fixed
 * safe message, and the trace id for cross-system lookup. `.code` (e.g.
 * EXAM_SCORE_MISMATCH) is a stable domain identifier, not free text, so it is
 * forwarded as `backendCode` for a client to key off. Anything else - a
 * TypeError from a resolver, an Error somebody threw without a code - is
 * reported as a generic internal error, and `logServerErrors` keeps the detail.
 */
export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const original = unwrap(error);
  const code = publicCode(original, formattedError.extensions?.code);

  if (original instanceof BackendError) {
    return {
      message: SAFE_MESSAGES[code],
      extensions: {
        code,
        backendCode: original.code,
        traceId: original.traceId,
      },
    };
  }

  if (code === "INTERNAL_SERVER_ERROR") {
    return { message: SAFE_MESSAGES[code], extensions: { code } };
  }
  return formattedError;
}

/**
 * Writes down what `formatError` keeps from the client: the errors that are the
 * server's doing rather than the caller's. A 4xx from the backend or a query
 * that does not validate is the caller's to fix and is not logged.
 */
export const logServerErrors: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart() {
    return {
      async didEncounterErrors({ contextValue, operationName, errors }) {
        for (const error of errors) {
          const original = unwrap(error);
          const code = publicCode(original, error.extensions?.code);
          if (
            code !== "INTERNAL_SERVER_ERROR" &&
            code !== "BACKEND_UNAVAILABLE"
          )
            continue;

          logServerError({
            requestId: contextValue.requestId,
            where:
              `graphql ${operationName ?? "anonymous"} ${error.path?.join(".") ?? ""}`.trim(),
            error: original,
          });
        }
      },
    };
  },
};
