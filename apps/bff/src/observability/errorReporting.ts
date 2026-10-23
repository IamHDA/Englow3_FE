import * as Sentry from "@sentry/node";

import { BackendError } from "../shared/http/backendError.js";

let started = false;

/**
 * Starts error reporting when a `SENTRY_DSN` is configured, and otherwise does
 * nothing at all - local runs, tests and any deployment without the variable
 * behave exactly as before.
 *
 * Nothing about the person is attached: no default PII, no request bodies, no
 * headers. A learner's work and their token both travel in those.
 */
export function initErrorReporting(
  environment = process.env.SENTRY_ENVIRONMENT,
) {
  const dsn = process.env.SENTRY_DSN;
  if (started || !dsn) return;
  started = true;
  Sentry.init({
    dsn,
    environment: environment ?? process.env.NODE_ENV ?? "development",
    release: process.env.RELEASE_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}

/**
 * Reports an error the client was not shown the detail of. A refusal the
 * caller caused (a 4xx from the backend) is the system working, not a defect,
 * and would bury the real ones.
 */
export function reportError(
  error: unknown,
  context: { requestId: string; where: string },
) {
  if (!started) return;
  if (
    error instanceof BackendError &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return;
  }
  Sentry.captureException(error, {
    tags: { where: context.where, requestId: context.requestId },
  });
}
