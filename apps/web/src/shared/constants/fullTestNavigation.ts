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

/**
 * Which full test an IELTS paper was opened from for practice. The paper page
 * then leads back there, and sends "sit it for real" to the full test.
 */
export const FULL_TEST_PARAM = "fullTest";

export const readFullTest = readFullTestSitting;

export const fullTestPath = (fullTestId: string) =>
  `/exams/full-tests/${encodeURIComponent(fullTestId)}`;

/** Practising a full test's Listening + Reading paper, part by part. */
export const paperPracticePath = (examId: string, fullTestId: string) =>
  `/exams/${encodeURIComponent(examId)}?${FULL_TEST_PARAM}=${encodeURIComponent(fullTestId)}`;

/** The library tab listing a variant's full tests. */
export const ieltsLibraryPath = (variant?: string | null) =>
  `/exams?tab=${variant === "GENERAL" ? "ielts_general" : "ielts_academic"}`;
