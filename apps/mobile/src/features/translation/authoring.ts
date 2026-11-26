export type AuthoringItem = {
  sourceVi: string;
  referenceEn: string;
  notes?: string | null;
};

/**
 * The accents NFD splits off a letter (U+0300 to U+036F). Spelled by code
 * point rather than `\p{Diacritic}`, which Hermes may not know.
 */
const COMBINING_MARKS = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  "g",
);

/** Lowercase, unaccented, hyphenated - what every other content slug looks like. As the web's slugify. */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
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
    .filter(
      (parts): parts is [string, string, ...string[]] =>
        parts.length >= 2 &&
        Boolean(parts[0]?.trim()) &&
        Boolean(parts[1]?.trim()),
    )
    .map(([vi, en, notes]) => ({
      sourceVi: vi.trim(),
      referenceEn: en.trim(),
      notes: notes?.trim() ?? "",
    }));
}
