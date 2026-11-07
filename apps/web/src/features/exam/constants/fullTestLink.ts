/**
 * The query parameter a full test sitting adds when it sends the learner to
 * its Listening + Reading paper. The paper is then sat in full only - the
 * sitting counts a FULL attempt and nothing else - and the way back leads to
 * the sitting rather than the exam library.
 */
export const FULL_TEST_SITTING_PARAM = "fullTestSitting";

export const fullTestSittingPath = (sittingId: string) =>
  `/exams/full-tests/sittings/${sittingId}`;

export const paperForFullTestPath = (examId: string, sittingId: string) =>
  `/exams/${examId}?${FULL_TEST_SITTING_PARAM}=${encodeURIComponent(sittingId)}`;
