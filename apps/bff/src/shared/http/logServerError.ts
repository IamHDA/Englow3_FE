import { BackendError } from "./backendError.js";

/**
 * One JSON line for an error whose detail the client is not shown. Only what is
 * needed to find it again: where it happened, which request, what went wrong,
 * and the backend's own trace id. Never headers or bodies - the token and a
 * learner's work travel in those.
 */
export function logServerError({
  requestId,
  where,
  error,
}: {
  requestId: string;
  where: string;
  error: unknown;
}) {
  const backend = error instanceof BackendError ? error : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      where,
      type: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      status: backend?.status,
      backendCode: backend?.code,
      traceId: backend?.traceId,
      backendMethod: backend?.method,
      backendPath: backend?.path,
      durationMs: backend?.durationMs,
      // A BackendError's stack only points at the client; the backend's own
      // trace id is the way into the other side.
      stack: !backend && error instanceof Error ? error.stack : undefined,
    }),
  );
}
