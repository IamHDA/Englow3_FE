import {
  Bot,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  Layers,
  Mic,
  Route,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type StudyLink = NavLink & {
  description: string;
};

/** Icon on the Study trigger, kept in step with the other two nav items. */
export const studyIcon: LucideIcon = GraduationCap;

export const studyLinks: StudyLink[] = [
  {
    label: "Phát âm",
    description: "Chấm điểm phát âm AI theo thời gian thực",
    href: "/study/pronunciation",
    icon: Mic,
  },
  {
    label: "Thẻ ghi nhớ",
    description: "Bộ thẻ 3D tối ưu theo khả năng ghi nhớ của bạn",
    href: "/study/flashcards",
    icon: Layers,
  },
  {
    label: "Chính tả",
    description: "Thử thách nghe và gõ lại",
    href: "/study/dictation",
    icon: Headphones,
  },
  {
    label: "Lộ trình hàng ngày",
    description: "Bài học thích ứng dành riêng cho bạn",
    href: "/study/daily-path",
    icon: Route,
  },
];

export const primaryLinks: NavLink[] = [
  { label: "Thi thử", href: "/mock-test", icon: ClipboardCheck },
  { label: "Gia sư AI", href: "/ai-tutor", icon: Bot },
];
