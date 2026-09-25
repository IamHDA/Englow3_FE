import { OverviewContentKind } from "@/lib/graphql/generated";

/** How the overview names each kind of content, and where its list lives. */
export const OVERVIEW_KINDS: Record<
  OverviewContentKind,
  { label: string; unit: string; href: string }
> = {
  [OverviewContentKind.FLASHCARD_SET]: {
    label: "Bộ thẻ từ",
    unit: "bộ thẻ",
    href: "/admin/content?kind=FLASHCARD_SET",
  },
  [OverviewContentKind.QUIZ]: {
    label: "Bài trắc nghiệm",
    unit: "bài trắc nghiệm",
    href: "/admin/content?kind=QUIZ",
  },
  [OverviewContentKind.DICTATION_LESSON]: {
    label: "Bài nghe chép",
    unit: "bài nghe chép",
    href: "/admin/content?kind=DICTATION_LESSON",
  },
  [OverviewContentKind.SPEAKING_PROMPT]: {
    label: "Câu luyện nói",
    unit: "câu luyện nói",
    href: "/admin/content?kind=SPEAKING_PROMPT",
  },
  [OverviewContentKind.EXAM]: {
    label: "Đề thi",
    unit: "đề thi",
    href: "/admin/exams",
  },
};
