import type { Entry } from "./types";

/**
 * What each authoring entry asks for, as the web's AuthoringFields declares
 * it. Kept apart from the form so validation can read it without React.
 */
export type Field = {
  key: keyof Entry;
  vi: string;
  en: string;
  required?: boolean;
  multiline?: boolean;
  list?: boolean;
};

export const cardFields: Field[] = [
  { key: "lemma", vi: "Từ vựng", en: "Word", required: true },
  { key: "partOfSpeech", vi: "Từ loại", en: "Part of speech", required: true },
  { key: "senseLabel", vi: "Nghĩa đang học", en: "Sense", required: true },
  { key: "ipaUs", vi: "Phiên âm US", en: "US pronunciation", required: true },
  { key: "ipaUk", vi: "Phiên âm UK", en: "UK pronunciation" },
  {
    key: "definitionEn",
    vi: "Định nghĩa tiếng Anh",
    en: "English definition",
    required: true,
    multiline: true,
  },
  {
    key: "definitionVi",
    vi: "Nghĩa tiếng Việt",
    en: "Vietnamese meaning",
    required: true,
    multiline: true,
  },
  {
    key: "exampleSentence",
    vi: "Câu ví dụ",
    en: "Example sentence",
    required: true,
    multiline: true,
  },
  {
    key: "exampleTranslationVi",
    vi: "Dịch câu ví dụ",
    en: "Example translation",
    multiline: true,
  },
  {
    key: "mnemonicTipVi",
    vi: "Mẹo ghi nhớ",
    en: "Memory tip",
    multiline: true,
  },
];

export const sentenceFields: Field[] = [
  {
    key: "text",
    vi: "Câu đúng để đối chiếu",
    en: "Answer transcript",
    required: true,
    multiline: true,
  },
  { key: "translationVi", vi: "Bản dịch", en: "Translation", multiline: true },
  { key: "hintFirstLetters", vi: "Gợi ý chữ đầu", en: "First-letter hint" },
  { key: "hintRevealWord", vi: "Từ gợi ý", en: "Revealed word" },
  {
    key: "hintPartialTranscript",
    vi: "Gợi ý một phần câu",
    en: "Partial transcript",
    multiline: true,
  },
];

export const questionTypes = [
  { value: "MULTIPLE_CHOICE", vi: "Chọn đáp án", en: "Multiple choice" },
  { value: "FILL_BLANK", vi: "Điền chỗ trống", en: "Fill in the blank" },
  { value: "REWRITE", vi: "Viết lại câu", en: "Rewrite" },
  { value: "REORDER", vi: "Sắp xếp từ", en: "Reorder" },
  { value: "MATCHING", vi: "Ghép cặp", en: "Matching" },
];

/** The fields a quiz question adds for its type. */
export function quizShapeFields(type: string | undefined): Field[] {
  return type === "FILL_BLANK"
    ? [
        { key: "beforeText", vi: "Phần trước chỗ trống", en: "Before blank" },
        { key: "afterText", vi: "Phần sau chỗ trống", en: "After blank" },
        {
          key: "acceptedAnswers",
          vi: "Các đáp án được chấp nhận",
          en: "Accepted answers",
          required: true,
          list: true,
        },
      ]
    : type === "REWRITE"
      ? [
          {
            key: "originalSentence",
            vi: "Câu gốc",
            en: "Original sentence",
            required: true,
          },
          { key: "rewriteKeyword", vi: "Từ khóa cần dùng", en: "Keyword" },
          {
            key: "correctWords",
            vi: "Từng từ của đáp án, đúng thứ tự",
            en: "Answer words in order",
            required: true,
            list: true,
          },
          {
            key: "wordBank",
            vi: "Ngân hàng từ (có thể để trống để dùng đáp án)",
            en: "Word bank (optional)",
            list: true,
          },
        ]
      : type === "REORDER"
        ? [
            {
              key: "correctOrder",
              vi: "Từng từ theo thứ tự đúng",
              en: "Words in correct order",
              required: true,
              list: true,
            },
            {
              key: "scrambledWords",
              vi: "Từng từ đưa cho người học (có thể để trống)",
              en: "Scrambled words (optional)",
              list: true,
            },
          ]
        : [];
}

export const quizBaseFields: Field[] = [
  { key: "title", vi: "Tên câu hỏi", en: "Question title", required: true },
  {
    key: "prompt",
    vi: "Yêu cầu",
    en: "Prompt",
    required: true,
    multiline: true,
  },
  {
    key: "explanation",
    vi: "Giải thích sau khi làm",
    en: "Answer explanation",
    multiline: true,
  },
];
