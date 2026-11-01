"use client";

import { usePathname } from "next/navigation";
import { createContext, useState, type ReactNode } from "react";

import { useAccountProfile } from "@/features/account";
import {
  hasOnboardingStepUi,
  ONBOARDING_STEP_ORDER,
} from "@/features/onboarding/constants/onboardingSteps";
import { OnboardingStep, Role } from "@/lib/graphql/generated";

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
  /**
   * The step the popup shows. While goals are being edited after onboarding
   * finished, this walks the flow on the client: the backend keeps a finished
   * learner at COMPLETED, so its step cannot say where an edit has got to.
   */
  step: OnboardingStep | null;
  /** True while a learner who finished onboarding is changing their goals. */
  editing: boolean;
  /** Where an edit goes after a step is saved; null ends the edit. */
  advanceEdit: (next: OnboardingStep | null) => void;
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
    // Onboarding là khái niệm riêng của người học - STAFF/ADMIN không có mục
    // tiêu học tập nên `onboardingStep` của họ không phản ánh gì cả và không
    // bao giờ được đẩy sang COMPLETED.
    profile.role === Role.LEARNER &&
    step != null &&
    step !== OnboardingStep.COMPLETED &&
    hasOnboardingStepUi(step) &&
    !pathname.startsWith(AUTH_PATH_PREFIX);

  // Suy ra `opened` từ `requiresOnboarding` chứ không đặt bằng effect: bật lần
  // đầu là tự nhiên, đóng thì `dismissed` ghi đè trong đúng phiên này. Tải lại
  // trang xoá `dismissed` nên popup bật lại nếu onboarding vẫn dở.
  const [dismissed, setDismissed] = useState(false);
  const [editStep, setEditStep] = useState<OnboardingStep | null>(null);
  const editing = editStep !== null && !requiresOnboarding;
  const opened = (requiresOnboarding && !dismissed) || editing;

  function open() {
    if (requiresOnboarding) {
      setDismissed(false);
      return;
    }
    // A finished learner changing their goals walks the same steps again,
    // from the start, with what they chose last time filled in.
    if (profile?.role === Role.LEARNER && step === OnboardingStep.COMPLETED) {
      setEditStep(ONBOARDING_STEP_ORDER[0]);
    }
  }

  function close() {
    setDismissed(true);
    setEditStep(null);
    // Đóng có thể xảy ra sau khi bước hiện tại vừa đổi ở nơi khác (nhiệm vụ kế
    // tiếp: gửi lựa chọn lên BFF) - đọc lại để header và lần mở sau đúng bước
    // mới nhất. Hôm nay chưa có mutation nào đổi bước nên đây là no-op.
    void refresh();
  }

  return (
    <OnboardingContext.Provider
      value={{
        requiresOnboarding,
        opened,
        step: editing ? editStep : step,
        editing,
        advanceEdit: setEditStep,
        open,
        close,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
