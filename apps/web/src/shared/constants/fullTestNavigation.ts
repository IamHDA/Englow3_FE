/** A full test's return context travels through its paper, task and answer pages. */
export const FULL_TEST_SITTING_PARAM = "fullTestSitting";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readFullTestSitting(value: string | string[] | undefined) {
  return typeof value === "string" && UUID.test(value) ? value : null;
}

export const fullTestSittingPath = (sittingId: string) =>
  `/exams/full-tests/sittings/${encodeURIComponent(sittingId)}`;

export function withFullTestSitting(path: string, sittingId?: string | null) {
  return sittingId
    ? `${path}${path.includes("?") ? "&" : "?"}${FULL_TEST_SITTING_PARAM}=${encodeURIComponent(sittingId)}`
    : path;
}
