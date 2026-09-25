"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useAccountProfile } from "@/features/account";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
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
  usePlacementExamLazyQuery,
} from "@/lib/graphql/generated/hooks";

import type {
  CefrLevel,
  LearningGoalInput,
  LearningSkill,
  OnboardingStateFieldsFragment,
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
 * Bước kế tiếp do backend quyết định (người luyện chứng chỉ đi qua
 * CERTIFICATE_TARGET, người khác nhảy thẳng tới CURRENT_LEVEL) và nằm ngay
 * trong kết quả mutation. Ghi thẳng kết quả đó vào hồ sơ thay vì đọc lại
 * `CurrentUser`: đọc lại tốn thêm hai lượt tới backend mỗi bước, và đó là lý do
 * chuyển bước từng chậm.
 */
export function useOnboardingActions() {
  const { applyOnboardingState } = useAccountProfile();
  const { close } = useOnboarding();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectPurposes, purposesState] = useSelectLearningPurposesMutation();
  const [setCertificate, certificateState] = useSetCertificateTargetMutation();
  const [setLevel, levelState] = useSetCurrentLevelMutation();
  const [setGoal, goalState] = useSetLearningGoalMutation();
  const [selectSkills, skillsState] = useSelectTargetSkillsMutation();
  const [complete, completeState] = useCompleteOnboardingMutation();
  const [loadPlacementExam, placementState] = usePlacementExamLazyQuery();

  const pending =
    purposesState.loading ||
    certificateState.loading ||
    levelState.loading ||
    goalState.loading ||
    skillsState.loading ||
    completeState.loading ||
    placementState.loading;

  /**
   * Chạy mutation rồi ghi trạng thái mới vào hồ sơ. Lỗi được giữ lại thành lời
   * tiếng Việt chứ không ném tiếp - popup onboarding không có nơi nào bắt được.
   */
  const run = useCallback(
    async (
      mutate: () => Promise<OnboardingStateFieldsFragment | null | undefined>,
    ) => {
      setErrorMessage(null);
      let state: OnboardingStateFieldsFragment | null | undefined;
      try {
        state = await mutate();
      } catch (error) {
        setErrorMessage(messageForError(error));
        return;
      }
      if (state) applyOnboardingState(state);
    },
    [applyOnboardingState],
  );

  return {
    pending,
    errorMessage,
    submitLearningPurposes: useCallback(
      (purposeIds: number[]) =>
        run(async () => {
          const { data } = await selectPurposes({ variables: { purposeIds } });
          return data?.selectLearningPurposes;
        }),
      [run, selectPurposes],
    ),
    submitCertificateTarget: useCallback(
      (certificateType: TargetCertificate) =>
        run(async () => {
          const { data } = await setCertificate({
            variables: { certificateType },
          });
          return data?.setCertificateTarget;
        }),
      [run, setCertificate],
    ),
    submitCurrentLevel: useCallback(
      (level: CefrLevel) =>
        run(async () => {
          const { data } = await setLevel({ variables: { level } });
          return data?.setCurrentLevel;
        }),
      [run, setLevel],
    ),
    submitLearningGoal: useCallback(
      (input: LearningGoalInput) =>
        run(async () => {
          const { data } = await setGoal({ variables: { input } });
          return data?.setLearningGoal;
        }),
      [run, setGoal],
    ),
    /**
     * Bước cuối gọi hai endpoint: backend ghi kỹ năng nhưng cố ý không đẩy
     * bước, `complete` mới là thứ chuyển sang COMPLETED.
     */
    /**
     * Bài kiểm tra đầu xếp trình độ chạy trên đúng luồng thi bình thường, nên ở
     * đây chỉ cần hỏi backend đề nào rồi điều hướng tới đó. Điểm chấm xong sẽ tự
     * ghi trình độ và đẩy onboarding sang bước kế - không cần quay lại popup.
     */
    startPlacementTest: useCallback(async () => {
      setErrorMessage(null);
      const { data, error } = await loadPlacementExam();

      if (error || !data) {
        setErrorMessage(messageForError(error));
        return;
      }

      close();
      router.push(`/exams/${data.placementExam.id}`);
    }, [loadPlacementExam, close, router]),
    submitTargetSkills: useCallback(
      (skills: LearningSkill[]) =>
        run(async () => {
          await selectSkills({ variables: { skills } });
          const { data } = await complete();
          return data?.completeOnboarding;
        }),
      [run, selectSkills, complete],
    ),
  };
}
