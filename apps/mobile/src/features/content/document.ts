import type {
  AuthoringDocument,
  AuthoringKind,
  Entry,
  Metadata,
} from "./types";

/** What each kind is called on the editor's title. */
export const KIND_NAMES: Record<AuthoringKind, string> = {
  FLASHCARD_SET: "Bộ từ vựng",
  QUIZ: "Quiz",
  DICTATION_LESSON: "Bài nghe chép chính tả",
  SPEAKING_PROMPT: "Bài phát âm — đọc theo mẫu",
  TRANSLATION_SET: "Bộ câu luyện dịch",
  EXAM: "Đề thi",
};

export const AUTHORING_KINDS = Object.keys(KIND_NAMES) as AuthoringKind[];

export function isAuthoringKind(value: string): value is AuthoringKind {
  return (AUTHORING_KINDS as string[]).includes(value);
}

/** Most entries a document of each kind may hold, as the web's editor caps them. */
export const ENTRY_LIMITS: Partial<Record<AuthoringKind, number>> = {
  QUIZ: 100,
  DICTATION_LESSON: 200,
  FLASHCARD_SET: 500,
};

export const makeEntry = (kind: AuthoringKind): Entry =>
  kind === "QUIZ"
    ? {
        questionType: "MULTIPLE_CHOICE",
        title: "",
        prompt: "",
        points: 1,
        explanation: "",
        options: [
          { label: "A", content: "", correct: false },
          { label: "B", content: "", correct: false },
        ],
        acceptedAnswers: [],
        correctWords: [],
        correctOrder: [],
        wordBank: [],
        scrambledWords: [],
        pairs: [
          { leftText: "", rightText: "" },
          { leftText: "", rightText: "" },
        ],
      }
    : kind === "DICTATION_LESSON"
      ? {
          text: "",
          translationVi: "",
          audioObjectKey: "",
          audioDurationSeconds: 1,
        }
      : {
          lemma: "",
          partOfSpeech: "",
          senseLabel: "",
          ipaUs: "",
          definitionEn: "",
          definitionVi: "",
          exampleSentence: "",
        };

export function initialDocument(kind: AuthoringKind): AuthoringDocument {
  const metadata: Metadata = {
    slug: "",
    title: "",
    name: "",
    description: "",
    topic: "",
    category: "",
    targetLevel: null,
    timeLimitSeconds: 600,
    passingScorePercent: 60,
    referenceText: "",
    ipaTranscript: "",
    translationVi: "",
    phonemeTarget: "",
    tips: [],
    examType: "MOCK",
    certificateType: null,
    certificateVariant: null,
    durationSeconds: 1800,
    maxRawScore: 1,
    passScore: null,
  };
  return {
    version: 0,
    metadata,
    content:
      kind === "FLASHCARD_SET"
        ? { cards: [makeEntry(kind)] }
        : kind === "QUIZ"
          ? { questions: [makeEntry(kind)] }
          : kind === "EXAM"
            ? { sections: [] }
            : undefined,
    sentences: kind === "DICTATION_LESSON" ? [makeEntry(kind)] : undefined,
  };
}

/** The backend returns cards/questions at the top level; the editor keeps them under content. */
export function editableDocument(
  kind: AuthoringKind,
  data: AuthoringDocument,
): AuthoringDocument {
  return {
    ...data,
    content:
      kind === "FLASHCARD_SET"
        ? { cards: data.cards ?? [] }
        : kind === "QUIZ"
          ? { questions: data.questions ?? [] }
          : data.content,
  };
}

export function entriesOf(
  kind: AuthoringKind,
  doc: AuthoringDocument,
): Entry[] {
  return kind === "FLASHCARD_SET"
    ? (doc.content?.cards ?? [])
    : kind === "QUIZ"
      ? (doc.content?.questions ?? [])
      : (doc.sentences ?? []);
}

export function withEntries(
  kind: AuthoringKind,
  doc: AuthoringDocument,
  entries: Entry[],
): AuthoringDocument {
  return kind === "DICTATION_LESSON"
    ? { ...doc, sentences: entries }
    : {
        ...doc,
        content: kind === "QUIZ" ? { questions: entries } : { cards: entries },
      };
}

export function entryPrefix(kind: AuthoringKind, index: number) {
  return kind === "DICTATION_LESSON"
    ? `sentences[${index}]`
    : `content.${kind === "QUIZ" ? "questions" : "cards"}[${index}]`;
}

export type MetadataField = {
  key: "name" | "title" | "topic" | "description";
  label: string;
  required?: boolean;
  maxLength: number;
};

/** The free-text fields at the top of the form, per kind (category is a picker). */
export function metadataFields(kind: AuthoringKind): MetadataField[] {
  if (kind === "FLASHCARD_SET")
    return [
      { key: "name", label: "Tên bộ thẻ", required: true, maxLength: 200 },
      { key: "topic", label: "Chủ đề", required: true, maxLength: 200 },
      { key: "description", label: "Mô tả", maxLength: 2000 },
    ];
  return [
    {
      key: "title",
      label: "Tiêu đề",
      required: true,
      maxLength: kind === "EXAM" ? 100 : 200,
    },
    ...(kind === "DICTATION_LESSON" || kind === "TRANSLATION_SET"
      ? [
          {
            key: "topic" as const,
            label: "Chủ đề",
            required: true,
            maxLength: 200,
          },
        ]
      : []),
    ...(kind === "QUIZ" || kind === "EXAM"
      ? [
          {
            key: "description" as const,
            label: "Mô tả",
            required: kind === "EXAM",
            maxLength: 2000,
          },
        ]
      : []),
  ];
}

/** What the backend saves: a slug when the author left it empty, and an exam's total from its questions. */
export function saveBody(
  kind: AuthoringKind,
  doc: AuthoringDocument,
  newId: () => string,
): AuthoringDocument {
  const body: AuthoringDocument = JSON.parse(
    JSON.stringify({ ...doc, media: undefined }),
  );
  body.metadata.slug ||= `lesson-${newId()}`;
  // A zero-question exam can be saved as a draft; publication validates completeness.
  if (kind === "EXAM")
    body.metadata.maxRawScore = Math.max(
      1,
      body.content?.sections?.reduce((n, s) => n + s.maxRawScore, 0) ?? 0,
    );
  return body;
}
