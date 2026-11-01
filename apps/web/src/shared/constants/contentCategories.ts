/**
 * Chủ đề của bài trắc nghiệm và bài phát âm: danh sách cố định ở backend.
 * Trước đây là chữ tự do, nên "Grammar", "grammar" và "Ngữ pháp" thành ba bộ
 * lọc; lộ trình cũng đọc chủ đề để biết bài luyện kỹ năng gì.
 */
export const QUIZ_CATEGORY_OPTIONS = [
  { value: "GRAMMAR", vi: "Ngữ pháp", en: "Grammar" },
  { value: "VOCABULARY", vi: "Từ vựng", en: "Vocabulary" },
  { value: "READING", vi: "Đọc hiểu", en: "Reading" },
  { value: "MIXED", vi: "Tổng hợp", en: "Mixed" },
] as const;

export const PROMPT_CATEGORY_OPTIONS = [
  { value: "SOUNDS", vi: "Âm", en: "Sounds" },
  { value: "WORD_STRESS", vi: "Trọng âm", en: "Word stress" },
  { value: "INTONATION", vi: "Ngữ điệu", en: "Intonation" },
  { value: "CONNECTED_SPEECH", vi: "Nối âm", en: "Connected speech" },
] as const;

const LABELS = new Map<string, { vi: string; en: string }>(
  [...QUIZ_CATEGORY_OPTIONS, ...PROMPT_CATEGORY_OPTIONS].map((option) => [
    option.value,
    option,
  ]),
);

/** The category as words; an unknown value is shown as it came. */
export function categoryLabel(value: string, isVi: boolean): string {
  const words = LABELS.get(value);
  return words ? (isVi ? words.vi : words.en) : value;
}
