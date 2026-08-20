import { OnboardingStep } from "@/lib/graphql/generated";

/**
 * Thứ tự hiển thị thật của các bước onboarding. Codegen xếp enum theo chữ cái
 * (`CERTIFICATE_TARGET` trước `LEARNING_PURPOSES`) nên thứ tự khai báo trong
 * enum không mang nghĩa gì - thứ tự đúng chỉ có ở đây, lấy từ thiết kế.
 */
export const ONBOARDING_STEP_ORDER: readonly OnboardingStep[] = [
  OnboardingStep.LEARNING_PURPOSES,
  OnboardingStep.CERTIFICATE_TARGET,
  OnboardingStep.CURRENT_LEVEL,
  OnboardingStep.LEARNING_GOAL,
  OnboardingStep.TARGET_SKILLS,
];

export const ONBOARDING_TOTAL_STEPS = ONBOARDING_STEP_ORDER.length;

/** Số hiệu 1-based để hiện badge "Bước n / tổng" - không ghi cứng số. */
export function getOnboardingStepNumber(step: OnboardingStep): number {
  return ONBOARDING_STEP_ORDER.indexOf(step) + 1;
}

/** Dùng chung cho bước thật và skeleton nên chỉ sửa một chỗ khi đổi lời. */
export const LEARNING_PURPOSE_COPY = {
  title: "Mục tiêu học tiếng Anh của bạn là gì?",
  subtitle:
    "Điều này giúp chúng tôi cá nhân hoá lộ trình học hằng ngày cho bạn.",
} as const;
