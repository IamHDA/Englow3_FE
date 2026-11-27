import {
  Bot,
  ClipboardCheck,
  Newspaper,
  GraduationCap,
  Headphones,
  Languages,
  Layers,
  Mic,
  Flag,
  Route,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AppTranslations } from "./translations";
import { vi } from "./translations/vi";

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Marks the link that carries a count of what is waiting behind it. */
  badge?: "friendRequests";
};

export type StudyLink = NavLink & {
  description: string;
};

/** Icon on the Study trigger, kept in step with the other two nav items. */
export const studyIcon: LucideIcon = GraduationCap;

export function getStudyLinks(t?: AppTranslations["nav"]): StudyLink[] {
  const nav = t || vi.nav;
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
      label: "Writing",
      description: nav.writingDesc,
      href: "/study/writing",
      icon: ClipboardCheck,
    },
    {
      label: "Speaking",
      description: nav.speakingDesc,
      href: "/study/speaking",
      icon: Mic,
    },
    {
      label: nav.dictation,
      description: nav.dictationDesc,
      href: "/study/dictation",
      icon: Headphones,
    },
    {
      label: nav.translation,
      description: nav.translationDesc,
      href: "/study/translation",
      icon: Languages,
    },
    {
      label: nav.roadmap,
      description: nav.roadmapDesc,
      href: "/study/roadmap",
      icon: Flag,
    },
    {
      label: nav.dailyPath,
      description: nav.dailyPathDesc,
      href: "/study/daily-path",
      icon: Route,
    },
    {
      label: nav.myWork,
      description: nav.myWorkDesc,
      href: "/study/assessments",
      icon: ClipboardCheck,
    },
  ];
}

export function getPrimaryLinks(t?: AppTranslations["nav"]): NavLink[] {
  const nav = t || vi.nav;
  return [
    { label: nav.exams, href: "/exams", icon: ClipboardCheck },
    { label: nav.aiTutor, href: "/ai-tutor", icon: Bot },
    // The blog is for every account: staff and admin read and write posts too.
    { label: nav.blog, href: "/blog", icon: Newspaper },
  ];
}

/**
 * Friends belong to learners: staff and admin have no friend list, so the
 * header leaves this link to them out. Hiding it is not what keeps them out -
 * the backend refuses every friend action for them.
 */
export function getFriendsLink(t?: AppTranslations["nav"]): NavLink {
  const nav = t || vi.nav;
  return {
    label: nav.friends,
    href: "/friends",
    icon: Users,
    badge: "friendRequests",
  };
}

// Backwards compatibility for existing imports
export const studyLinks: StudyLink[] = getStudyLinks();
export const primaryLinks: NavLink[] = getPrimaryLinks();
