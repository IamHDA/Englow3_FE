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
    label: "Pronunciation",
    description: "Real-time AI speech scoring",
    href: "/study/pronunciation",
    icon: Mic,
  },
  {
    label: "Flashcards",
    description: "3D decks tuned to your recall",
    href: "/study/flashcards",
    icon: Layers,
  },
  {
    label: "Dictation",
    description: "Listen-and-type challenges",
    href: "/study/dictation",
    icon: Headphones,
  },
  {
    label: "Daily Path",
    description: "Adaptive lessons picked for you",
    href: "/study/daily-path",
    icon: Route,
  },
];

export const primaryLinks: NavLink[] = [
  { label: "Mock Test", href: "/mock-test", icon: ClipboardCheck },
  { label: "AI Tutor", href: "/ai-tutor", icon: Bot },
];
