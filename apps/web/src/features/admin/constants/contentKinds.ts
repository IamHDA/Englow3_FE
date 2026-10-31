import { OverviewContentKind } from "@/lib/graphql/generated";

/** How the overview names each kind of content, and where its list lives. */
type Words = { vi: string; en: string };

export const OVERVIEW_KINDS: Record<
  OverviewContentKind,
  { label: Words; unit: Words; href: string }
> = {
  [OverviewContentKind.WRITING_ASSESSMENT]: {
    label: { vi: "Đề Writing", en: "Writing tasks" },
    unit: { vi: "đề", en: "tasks" },
    href: "/admin/assessments?skill=WRITING",
  },
  [OverviewContentKind.SPEAKING_ASSESSMENT]: {
    label: { vi: "Đề Speaking", en: "Speaking tasks" },
    unit: { vi: "đề", en: "tasks" },
    href: "/admin/assessments?skill=SPEAKING",
  },
  [OverviewContentKind.FLASHCARD_SET]: {
    label: { vi: "Bộ thẻ từ", en: "Flashcard sets" },
    unit: { vi: "bộ thẻ", en: "sets" },
    href: "/admin/content?kind=FLASHCARD_SET",
  },
  [OverviewContentKind.QUIZ]: {
    label: { vi: "Bài trắc nghiệm", en: "Quizzes" },
    unit: { vi: "bài trắc nghiệm", en: "quizzes" },
    href: "/admin/content?kind=QUIZ",
  },
  [OverviewContentKind.DICTATION_LESSON]: {
    label: { vi: "Bài nghe chép", en: "Dictation lessons" },
    unit: { vi: "bài nghe chép", en: "dictation lessons" },
    href: "/admin/content?kind=DICTATION_LESSON",
  },
  [OverviewContentKind.SPEAKING_PROMPT]: {
    label: { vi: "Câu luyện nói", en: "Pronunciation prompts" },
    unit: { vi: "câu luyện nói", en: "prompts" },
    href: "/admin/content?kind=SPEAKING_PROMPT",
  },
  [OverviewContentKind.EXAM]: {
    label: { vi: "Đề thi", en: "Exams" },
    unit: { vi: "đề thi", en: "exams" },
    href: "/admin/exams",
  },
};
