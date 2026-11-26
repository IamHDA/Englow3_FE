import {
  CefrLevel,
  LearningSkill,
  TargetCertificate,
} from "@/lib/graphql/generated";

/** Ordered lowest to highest; enum declaration order is alphabetical and means nothing. */
export const CEFR_ORDER: readonly CefrLevel[] = [
  CefrLevel.A1,
  CefrLevel.A2,
  CefrLevel.B1,
  CefrLevel.B2,
  CefrLevel.C1,
  CefrLevel.C2,
];

export const CEFR_LABELS: Record<
  CefrLevel,
  { label: string; description: string }
> = {
  [CefrLevel.A1]: {
    label: "A1 - Mới bắt đầu",
    description: "Chào hỏi, câu đơn giản",
  },
  [CefrLevel.A2]: {
    label: "A2 - Sơ cấp",
    description: "Giao tiếp nhu cầu hằng ngày",
  },
  [CefrLevel.B1]: {
    label: "B1 - Trung cấp",
    description: "Xử lý tình huống quen thuộc",
  },
  [CefrLevel.B2]: {
    label: "B2 - Trung cao cấp",
    description: "Thảo luận chủ đề trừu tượng",
  },
  [CefrLevel.C1]: {
    label: "C1 - Cao cấp",
    description: "Diễn đạt trôi chảy, linh hoạt",
  },
  [CefrLevel.C2]: {
    label: "C2 - Thành thạo",
    description: "Gần như người bản xứ",
  },
};

export const SKILL_LABELS: Record<LearningSkill, string> = {
  [LearningSkill.LISTENING]: "Nghe",
  [LearningSkill.SPEAKING]: "Nói",
  [LearningSkill.READING]: "Đọc",
  [LearningSkill.WRITING]: "Viết",
  [LearningSkill.VOCABULARY]: "Từ vựng",
  [LearningSkill.GRAMMAR]: "Ngữ pháp",
  [LearningSkill.PRONUNCIATION]: "Phát âm",
};

/** Same scales as the web's onboarding (CERTIFICATE_SCORE_RANGE). */
export const CERTIFICATE_SCORE_RANGE: Record<
  TargetCertificate,
  { min: number; max: number; step: number }
> = {
  [TargetCertificate.IELTS]: { min: 1, max: 9, step: 0.5 },
  [TargetCertificate.TOEIC]: { min: 10, max: 990, step: 5 },
};

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
}

/** "12:05" from seconds. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(hours > 0 ? 2 : 1, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
