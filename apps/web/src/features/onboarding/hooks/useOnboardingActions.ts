"use client";

import { useCallback, useState } from "react";

import { useAccountProfile } from "@/features/account";
import {
  ONBOARDING_ERROR_MESSAGES,
  ONBOARDING_GENERIC_ERROR,
} from "@/features/onboarding/constants/onboardingSteps";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useCompleteOnboardingMutation,
  useSelectLearningPurposesMutation,
  useSelectTargetSkillsMutation,
  useSetCertificateTargetMutation,
  useSetCurrentLevelMutation,
  useSetLearningGoalMutation,
} from "@/lib/graphql/generated/hooks";

import type {
  CefrLevel,
  LearningGoalInput,
  LearningSkill,
  TargetCertificate,
} from "@/lib/graphql/generated";

/**
 * Mã miền BFF gửi kèm ở `extensions.backendCode`. Thông báo gốc của Spring đã
 * bị chặn lại từ BFF nên đây là thứ duy nhất đủ ổn định để bắt lỗi theo trường
 * hợp cụ thể.
 */
function messageForError(error: unknown): string {
  if (
    error != null &&
    typeof error === "object" &&
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors)
  ) {
    const backendCode = error.graphQLErrors[0]?.extensions?.backendCode;
    if (typeof backendCode === "string") {
      return ONBOARDING_ERROR_MESSAGES[backendCode] ?? ONBOARDING_GENERIC_ERROR;
    }
  }
  return ONBOARDING_GENERIC_ERROR;
}

/**
 * Sáu hành động ghi của onboarding, gom về một chỗ cho `OnboardingGate` phát
 * xuống từng bước.
 *
 * Mỗi hành động chạy xong đều gọi `refresh()`: bước kế tiếp do backend quyết
 * định (người luyện chứng chỉ đi qua CERTIFICATE_TARGET, người khác nhảy thẳng
 * tới CURRENT_LEVEL) và nó nằm ở `Me.onboardingStep`, không nằm trong kết quả
 * mutation - đọc lại hồ sơ là cách duy nhất biết đang ở đâu.
 */
export function useOnboardingActions() {
  const { refresh } = useAccountProfile();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectPurposes, purposesState] = useSelectLearningPurposesMutation();
  const [setCertificate, certificateState] = useSetCertificateTargetMutation();
  const [setLevel, levelState] = useSetCurrentLevelMutation();
  const [setGoal, goalState] = useSetLearningGoalMutation();
  const [selectSkills, skillsState] = useSelectTargetSkillsMutation();
  const [complete, completeState] = useCompleteOnboardingMutation();

  const pending =
    purposesState.loading ||
    certificateState.loading ||
    levelState.loading ||
    goalState.loading ||
    skillsState.loading ||
    completeState.loading;

  /**
   * Chạy mutation rồi đọc lại hồ sơ. Lỗi được giữ lại thành lời tiếng Việt chứ
   * không ném tiếp - popup onboarding không có nơi nào bắt được.
   */
  const run = useCallback(
    async (mutate: () => Promise<unknown>) => {
      setErrorMessage(null);
      try {
        await mutate();
      } catch (error) {
        setErrorMessage(messageForError(error));
        return;
      }
      await refresh();
    },
    [refresh],
  );

  return {
    pending,
    errorMessage,
    submitLearningPurposes: useCallback(
      (purposeIds: number[]) =>
        run(() => selectPurposes({ variables: { purposeIds } })),
      [run, selectPurposes],
    ),
    submitCertificateTarget: useCallback(
      (certificateType: TargetCertificate) =>
        run(() => setCertificate({ variables: { certificateType } })),
      [run, setCertificate],
    ),
    submitCurrentLevel: useCallback(
      (level: CefrLevel) => run(() => setLevel({ variables: { level } })),
      [run, setLevel],
    ),
    submitLearningGoal: useCallback(
      (input: LearningGoalInput) =>
        run(() => setGoal({ variables: { input } })),
      [run, setGoal],
    ),
    /**
     * Bước cuối gọi hai endpoint: backend ghi kỹ năng nhưng cố ý không đẩy
     * bước, `complete` mới là thứ chuyển sang COMPLETED.
     */
    submitTargetSkills: useCallback(
      (skills: LearningSkill[]) =>
        run(async () => {
          await selectSkills({ variables: { skills } });
          await complete();
        }),
      [run, selectSkills, complete],
    ),
  };
}
