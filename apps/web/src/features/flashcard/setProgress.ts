import type { AppTranslations } from "@/shared/constants/translations";

/**
 * Đã thuộc bao nhiêu %, suy ra từ hai con số backend trả về thay vì lưu sẵn -
 * một phép chia ở một chỗ, không phải ba bản sao có thể lệch nhau.
 */
export function masteredPercent(set: {
  masteredCount: number;
  cardCount: number;
}): number {
  if (set.cardCount === 0) return 0;
  return Math.round((set.masteredCount / set.cardCount) * 100);
}

/** null nghĩa là chưa từng học, khác hẳn với "học 0 ngày trước". */
export function formatLastStudied(
  value: string | null,
  t: AppTranslations,
): string {
  if (!value) return t.flashcard.notStudiedYet;

  const days = Math.floor((Date.now() - Date.parse(value)) / 86_400_000);
  if (days <= 0) return t.flashcard.studiedToday;
  if (days === 1) return t.flashcard.studiedYesterday;
  return `${days} ${t.flashcard.daysAgoSuffix}`;
}
