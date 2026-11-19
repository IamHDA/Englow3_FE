import type { ChatTranslations } from "@/shared/constants/translations";

/** The sentence for a backend code, in the language `copy` is in; the general one for a code nobody wrote words for, or none. */
export function sentenceForCode(
  copy: ChatTranslations,
  code: string | null,
): string {
  return code && Object.hasOwn(copy.backendErrors, code)
    ? copy.backendErrors[code as keyof ChatTranslations["backendErrors"]]
    : copy.genericError;
}
