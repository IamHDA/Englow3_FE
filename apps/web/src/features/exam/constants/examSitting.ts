/**
 * Constants governing the exam sitting experience, timer thresholds,
 * palette states, and local persistence keys.
 */

/** Warning threshold in seconds (5 minutes remaining) */
export const TIMER_WARNING_THRESHOLD_SECONDS = 300;

/** Final critical countdown threshold in seconds (1 minute remaining) */
export const TIMER_CRITICAL_THRESHOLD_SECONDS = 60;

/** Local storage prefix for saving exam attempts during sitting */
export const EXAM_LOCAL_STORAGE_PREFIX = "englow3_exam_attempt_";

export type PaletteQuestionStatus =
  "answered" | "flagged" | "unanswered" | "current";

/** The element of a question on the part sheet, for scrolling to it. */
export function questionAnchorId(questionId: string): string {
  return `exam-question-${questionId}`;
}

/** The top of the part sheet, scrolled to when another part is opened. */
export const PART_SHEET_ANCHOR_ID = "exam-part-sheet";
