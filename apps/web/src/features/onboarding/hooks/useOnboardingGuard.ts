"use client";

import { notifications } from "@mantine/notifications";
import { Sparkles } from "lucide-react";
import { createElement, type MouseEvent } from "react";

import { ONBOARDING_REQUIRED_NOTIFICATION_ID } from "@/features/onboarding/constants/onboardingSteps";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";

/**
 * Chặn điều hướng/hành động khi chưa onboarding, kèm thông báo.
 *
 * Nhận `event` tuỳ chọn để dùng được cho cả hai kiểu gọi: `<Link>` cần
 * `preventDefault()` để không điều hướng, còn `Menu.Item` (Hồ sơ, Cài đặt)
 * chưa có trang đích nên chỉ cần báo.
 *
 * Không tự mở popup - chỉ báo rồi thôi, người dùng chủ động mở bằng nút
 * "Hoàn tất thiết lập" ở header nếu muốn làm ngay.
 *
 * Đã onboarding xong: không làm gì, để hành động gốc chạy bình thường.
 */
export function useOnboardingGuard() {
  const { requiresOnboarding } = useOnboarding();

  return function guardAction(event?: MouseEvent) {
    if (!requiresOnboarding) return;

    event?.preventDefault();

    notifications.show({
      id: ONBOARDING_REQUIRED_NOTIFICATION_ID,
      color: "orange",
      icon: createElement(Sparkles, { size: 18 }),
      title: "Hoàn tất thiết lập trước đã",
      message: "Chọn mục tiêu học để mở khoá bài học, thi thử và gia sư AI.",
    });
  };
}
