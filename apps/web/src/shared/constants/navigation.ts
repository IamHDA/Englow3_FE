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
import type { AppTranslations } from "./translations";
import { translations } from "./translations";

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

export function getStudyLinks(t?: AppTranslations["nav"]): StudyLink[] {
  const nav = t || translations.vi.nav;
  return [
    {
      label: nav.pronunciation,
      description: nav.pronunciationDesc,
      href: "/study/pronunciation",
      icon: Mic,
    },
    {
      label: nav.flashcards,
      description: nav.flashcardsDesc,
      href: "/study/flashcards",
      icon: Layers,
    },
    {
      label: nav.dictation,
      description: nav.dictationDesc,
      href: "/study/dictation",
      icon: Headphones,
    },
    {
      label: nav.dailyPath,
      description: nav.dailyPathDesc,
      href: "/study/daily-path",
      icon: Route,
    },
  ];
}

export function getPrimaryLinks(t?: AppTranslations["nav"]): NavLink[] {
  const nav = t || translations.vi.nav;
  return [
    { label: nav.exams, href: "/exams", icon: ClipboardCheck },
    { label: nav.aiTutor, href: "/ai-tutor", icon: Bot },
  ];
}

// Backwards compatibility for existing imports
export const studyLinks: StudyLink[] = getStudyLinks();
export const primaryLinks: NavLink[] = getPrimaryLinks();
