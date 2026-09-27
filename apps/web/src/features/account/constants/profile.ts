import { LearningSkill } from "@/lib/graphql/generated";
import type { AppTranslations } from "@/shared/constants/translations";

export const FULL_NAME_MAX_LENGTH = 60;
export const DISPLAY_NAME_MAX_LENGTH = 60;

export function skillLabel(skill: LearningSkill, t: AppTranslations): string {
  switch (skill) {
    case LearningSkill.LISTENING:
      return t.account.skillListening;
    case LearningSkill.READING:
      return t.account.skillReading;
    case LearningSkill.WRITING:
      return t.account.skillWriting;
    case LearningSkill.SPEAKING:
      return t.account.skillSpeaking;
    case LearningSkill.GRAMMAR:
      return t.account.skillGrammar;
    case LearningSkill.VOCABULARY:
      return t.account.skillVocabulary;
    case LearningSkill.PRONUNCIATION:
      return t.account.skillPronunciation;
  }
}
