export type AuthoringItem = {
  sourceVi: string;
  referenceEn: string;
  notes?: string | null;
};

/** Lowercase, unaccented, hyphenated - what every other content slug looks like. */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

/**
 * One sentence per line: Vietnamese, English and an optional note, split by
 * "|" or by a tab - which is what a row copied out of a spreadsheet becomes.
 */
export function parsePasted(text: string): AuthoringItem[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(/\t|\|/))
    .filter((parts) => parts.length >= 2 && parts[0].trim() && parts[1].trim())
    .map(([vi, en, notes]) => ({
      sourceVi: vi.trim(),
      referenceEn: en.trim(),
      notes: notes?.trim() ?? "",
    }));
}
