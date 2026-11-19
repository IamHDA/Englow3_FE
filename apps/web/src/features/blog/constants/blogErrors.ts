import type { BlogTranslations } from "@/shared/constants/translations";

import { MIN_SEARCH_TERM_LENGTH } from "./blog";

/** The sentence for a backend code, in the language `copy` is in; the general one for a code nobody wrote words for, or none. */
export function sentenceForCode(
  copy: BlogTranslations,
  code: string | null,
): string {
  const sentence =
    code && Object.hasOwn(copy.backendErrors, code)
      ? copy.backendErrors[code as keyof BlogTranslations["backendErrors"]]
      : copy.genericError;
  return sentence.replace("{min}", String(MIN_SEARCH_TERM_LENGTH));
}
