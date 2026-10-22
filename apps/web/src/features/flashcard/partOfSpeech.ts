/** Viết tắt hoa của từ loại, để cột hẹp vẫn đọc được: noun -> N, adjective -> ADJ. */
const ABBREVIATIONS: Record<string, string> = {
  noun: "N",
  verb: "V",
  adjective: "ADJ",
  adverb: "ADV",
  pronoun: "PRON",
  preposition: "PREP",
  conjunction: "CONJ",
  interjection: "INT",
  determiner: "DET",
  article: "ART",
  numeral: "NUM",
  number: "NUM",
  "modal verb": "MODAL",
  auxiliary: "AUX",
  "phrasal verb": "PHR V",
  phrase: "PHR",
};

/** Từ loại lạ (chưa có trong bảng) giữ nguyên chữ gốc, viết hoa, thay vì bị cắt hoặc mất. */
export function abbreviatePartOfSpeech(partOfSpeech: string): string {
  const key = partOfSpeech.trim().toLowerCase();
  return ABBREVIATIONS[key] ?? partOfSpeech.trim().toUpperCase();
}
