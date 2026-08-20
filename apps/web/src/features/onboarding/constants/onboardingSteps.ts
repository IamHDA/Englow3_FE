/**
 * Tổng số bước onboarding, theo enum `OnboardingStep` của backend: bốn bước
 * người dùng phải đi qua trước khi `COMPLETED`. Badge "Bước 1 / 4" đọc từ đây
 * chứ không ghi cứng số 4 trong component.
 */
export const ONBOARDING_TOTAL_STEPS = 4;

/** Thứ tự hiển thị của bước chọn mục đích học - bước đầu tiên. */
export const LEARNING_PURPOSE_STEP_NUMBER = 1;

/** Dùng chung cho bước thật và skeleton nên chỉ sửa một chỗ khi đổi lời. */
export const LEARNING_PURPOSE_COPY = {
  title: "Mục tiêu học tiếng Anh của bạn là gì?",
  subtitle:
    "Điều này giúp chúng tôi cá nhân hoá lộ trình học hằng ngày cho bạn.",
} as const;
