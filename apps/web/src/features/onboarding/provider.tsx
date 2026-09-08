"use client";

import { usePathname } from "next/navigation";
import { createContext, useState, type ReactNode } from "react";

import { useAccountProfile } from "@/features/account";
import { hasOnboardingStepUi } from "@/features/onboarding/constants/onboardingSteps";
import { OnboardingStep } from "@/lib/graphql/generated";

/**
 * Luồng xác thực (login, callback, đặt lại mật khẩu). Link đặt lại mật khẩu
 * của Supabase tạo sẵn phiên đăng nhập, nên không trừ nhóm này thì popup sẽ đè
 * lên form đặt mật khẩu mới giữa chừng.
 */
const AUTH_PATH_PREFIX = "/auth";

export type OnboardingContextValue = {
  /** Đã đăng nhập, chưa COMPLETED, và bước hiện tại đã có giao diện dựng. */
  requiresOnboarding: boolean;
  opened: boolean;
  open: () => void;
  close: () => void;
};

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { profile, refresh } = useAccountProfile();
  const pathname = usePathname();

  const step = profile?.onboardingStep ?? null;
  const requiresOnboarding =
    profile != null &&
    step != null &&
    step !== OnboardingStep.COMPLETED &&
    hasOnboardingStepUi(step) &&
    !pathname.startsWith(AUTH_PATH_PREFIX);

  // Suy ra `opened` từ `requiresOnboarding` chứ không đặt bằng effect: bật lần
  // đầu là tự nhiên, đóng thì `dismissed` ghi đè trong đúng phiên này. Tải lại
  // trang xoá `dismissed` nên popup bật lại nếu onboarding vẫn dở.
  const [dismissed, setDismissed] = useState(false);
  const opened = requiresOnboarding && !dismissed;

  function open() {
    setDismissed(false);
  }

  function close() {
    setDismissed(true);
    // Đóng có thể xảy ra sau khi bước hiện tại vừa đổi ở nơi khác (nhiệm vụ kế
    // tiếp: gửi lựa chọn lên BFF) - đọc lại để header và lần mở sau đúng bước
    // mới nhất. Hôm nay chưa có mutation nào đổi bước nên đây là no-op.
    void refresh();
  }

  return (
    <OnboardingContext.Provider
      value={{ requiresOnboarding, opened, open, close }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
