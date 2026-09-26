import { Gender } from "@/lib/graphql/generated";

export const FULL_NAME_MAX_LENGTH = 60;
export const DISPLAY_NAME_MAX_LENGTH = 60;

export type GenderOption = {
  value: Gender;
  label: string;
};

export const GENDER_OPTIONS: readonly GenderOption[] = [
  { value: Gender.MALE, label: "Nam" },
  { value: Gender.FEMALE, label: "Nữ" },
  { value: Gender.OTHER, label: "Khác" },
] as const;

export const ONBOARDING_STEP_LABELS: Record<string, string> = {
  LEARNING_PURPOSES: "Mục tiêu học tập",
  CERTIFICATE_TARGET: "Chứng chỉ mục tiêu",
  CURRENT_LEVEL: "Trình độ hiện tại",
  LEARNING_GOAL: "Mục tiêu điểm số",
  TARGET_SKILLS: "Kỹ năng trọng tâm",
  COMPLETED: "Đã thiết lập",
};

export const SKILL_LABELS: Record<string, string> = {
  LISTENING: "Nghe",
  READING: "Đọc",
  WRITING: "Viết",
  SPEAKING: "Nói",
  GRAMMAR: "Ngữ pháp",
  VOCABULARY: "Từ vựng",
  PRONUNCIATION: "Phát âm",
};
