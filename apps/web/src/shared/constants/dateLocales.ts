import type { Language } from "./translations";

/**
 * The locale a date is written in, by the interface language. Vietnamese is
 * dd/mm/yyyy; the English interface uses en-GB for the same day-first order, as
 * every other screen of the app does.
 */
export const DATE_LOCALES: Record<Language, string> = {
  vi: "vi-VN",
  en: "en-GB",
};
