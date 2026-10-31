import { CombinedGraphQLErrors } from "@apollo/client";

/**
 * Why a page could not show what it was asked for.
 *
 * - "not-found": the backend looked and there is no such thing (NOT_FOUND),
 *   or the id in the address is not even a well-formed id (BAD_USER_INPUT).
 *   Reloading will not help; the learner needs a way back.
 * - "unavailable": anything else - the server did not answer, or failed.
 *   Reloading later may well work.
 */
export type LoadErrorKind = "not-found" | "unavailable";

const NOT_FOUND_CODES = new Set(["NOT_FOUND", "BAD_USER_INPUT"]);

function extensionsOf(error: unknown) {
  return CombinedGraphQLErrors.is(error)
    ? error.errors.map((item) => item.extensions ?? {})
    : [];
}

export function loadErrorKind(error: unknown): LoadErrorKind {
  return extensionsOf(error).some(
    (extensions) =>
      typeof extensions.code === "string" &&
      NOT_FOUND_CODES.has(extensions.code),
  )
    ? "not-found"
    : "unavailable";
}

/**
 * The backend's own error code (e.g. "FLASHCARD_SET_NOT_FOUND"), which the BFF
 * forwards as `extensions.backendCode`. Null when the error did not come from
 * the backend at all - a network failure, say.
 *
 * Apollo Client 4 no longer has `error.graphQLErrors`; code that still looks
 * for it never finds a code and always falls back to its generic message.
 */
export function backendCodeOf(error: unknown): string | null {
  const code = extensionsOf(error)[0]?.backendCode;
  return typeof code === "string" ? code : null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether an id from the address bar could name anything at all. A page with
 * nothing to fetch up front (the quiz start screen) uses it to say "not found"
 * straight away rather than after the learner presses Start.
 */
export function isWellFormedId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

/** The BFF's own error code (e.g. "FORBIDDEN", "NOT_FOUND"), if any. */
export function errorCodeOf(error: unknown): string | null {
  const code = extensionsOf(error)[0]?.code;
  return typeof code === "string" ? code : null;
}
