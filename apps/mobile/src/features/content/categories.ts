/** Quiz and pronunciation categories: a fixed list on the backend, as the web's shared/constants/contentCategories. */
export const QUIZ_CATEGORY_OPTIONS = [
  { value: "GRAMMAR", label: "Ngữ pháp" },
  { value: "VOCABULARY", label: "Từ vựng" },
  { value: "READING", label: "Đọc hiểu" },
  { value: "MIXED", label: "Tổng hợp" },
] as const;

export const PROMPT_CATEGORY_OPTIONS = [
  { value: "SOUNDS", label: "Âm" },
  { value: "WORD_STRESS", label: "Trọng âm" },
  { value: "INTONATION", label: "Ngữ điệu" },
  { value: "CONNECTED_SPEECH", label: "Nối âm" },
] as const;
