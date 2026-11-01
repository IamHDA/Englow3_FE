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
  useCreateRoadmapMutation,
  useStartLevelCheckMutation,
} from "@/lib/graphql/generated/hooks";
import { notifications } from "@mantine/notifications";

import { OnboardingStep } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import { LevelCheckPurpose } from "@/lib/graphql/generated";
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
 * hợp cụ thể. Trước đây hàm này đọc `error.graphQLErrors` - Apollo Client 4 đã
 * bỏ thuộc tính đó, nên mọi lỗi đều rơi về câu chung chung.
 */
function messageForError(error: unknown, isVi: boolean): string {
  const backendCode = backendCodeOf(error);
  const words =
    backendCode === null
      ? ONBOARDING_GENERIC_ERROR
      : (ONBOARDING_ERROR_MESSAGES[backendCode] ?? ONBOARDING_GENERIC_ERROR);
  return isVi ? words.vi : words.en;
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
  const { close, editing, advanceEdit } = useOnboarding();
  const router = useRouter();
  const { isVi } = useLanguage();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectPurposes, purposesState] = useSelectLearningPurposesMutation();
  const [setCertificate, certificateState] = useSetCertificateTargetMutation();
  const [setLevel, levelState] = useSetCurrentLevelMutation();
  const [setGoal, goalState] = useSetLearningGoalMutation();
  const [selectSkills, skillsState] = useSelectTargetSkillsMutation();
  const [complete, completeState] = useCompleteOnboardingMutation();
  const [loadPlacementExam, placementState] = usePlacementExamLazyQuery();
  const [startLevelCheck, levelCheckState] = useStartLevelCheckMutation();
  const [createRoadmap] = useCreateRoadmapMutation();

  const pending =
    purposesState.loading ||
    certificateState.loading ||
    levelState.loading ||
    goalState.loading ||
    skillsState.loading ||
    completeState.loading ||
    placementState.loading ||
    levelCheckState.loading;

  /**
   * Chạy mutation rồi ghi trạng thái mới vào hồ sơ. Lỗi được giữ lại thành lời
   * tiếng Việt chứ không ném tiếp - popup onboarding không có nơi nào bắt được.
   */
  const run = useCallback(
    async (
      mutate: () => Promise<OnboardingStateFieldsFragment | null | undefined>,
      /** Where an edit of finished goals goes next; null when this was the last step. */
      nextWhenEditing: (
        state: OnboardingStateFieldsFragment,
      ) => OnboardingStep | null,
    ) => {
      setErrorMessage(null);
      let state: OnboardingStateFieldsFragment | null | undefined;
      try {
        state = await mutate();
      } catch (error) {
        setErrorMessage(messageForError(error, isVi));
        return;
      }
      if (!state) return;
      applyOnboardingState(state);
      if (editing) {
        const next = nextWhenEditing(state);
        advanceEdit(next);
        if (next === null)
          notifications.show({
            color: "teal",
            message: isVi
              ? "Đã cập nhật mục tiêu học."
              : "Your learning goals are updated.",
          });
      }
    },
    [applyOnboardingState, isVi, editing, advanceEdit],
  );

  return {
    pending,
    errorMessage,
    submitLearningPurposes: useCallback(
      (purposeIds: number[]) =>
        run(
          async () => {
            const { data } = await selectPurposes({
              variables: { purposeIds },
            });
            return data?.selectLearningPurposes;
          },
          (state) =>
            // The same branch the backend takes for a learner still onboarding.
            state.certificateLearner
              ? OnboardingStep.CERTIFICATE_TARGET
              : OnboardingStep.CURRENT_LEVEL,
        ),
      [run, selectPurposes],
    ),
    submitCertificateTarget: useCallback(
      (certificateType: TargetCertificate) =>
        run(
          async () => {
            const { data } = await setCertificate({
              variables: { certificateType },
            });
            return data?.setCertificateTarget;
          },
          () => OnboardingStep.CURRENT_LEVEL,
        ),
      [run, setCertificate],
    ),
    submitCurrentLevel: useCallback(
      (level: CefrLevel) =>
        run(
          async () => {
            const { data } = await setLevel({ variables: { level } });
            return data?.setCurrentLevel;
          },
          () => OnboardingStep.LEARNING_GOAL,
        ),
      [run, setLevel],
    ),
    submitLearningGoal: useCallback(
      (input: LearningGoalInput) =>
        run(
          async () => {
            const { data } = await setGoal({ variables: { input } });
            return data?.setLearningGoal;
          },
          () => OnboardingStep.TARGET_SKILLS,
        ),
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
      try {
        const { data, error } = await loadPlacementExam();

        if (error || !data) {
          setErrorMessage(messageForError(error, isVi));
          return;
        }

        close();
        router.push(`/exams/${data.placementExam.id}`);
      } catch (error) {
        setErrorMessage(messageForError(error, isVi));
      }
    }, [loadPlacementExam, close, router, isVi]),
    submitTargetSkills: useCallback(
      (skills: LearningSkill[]) =>
        run(
          async () => {
            await selectSkills({ variables: { skills } });
            const { data } = await complete();
            // The roadmap is made by the system as soon as the goal is known. A
            // refusal here (no content yet, say) is not the learner's problem to
            // solve in onboarding; the roadmap page offers to try again.
            if (data?.completeOnboarding) {
              createRoadmap().catch(() => undefined);
            }
            return data?.completeOnboarding;
          },
          () => null,
        ),
      [run, selectSkills, complete, createRoadmap],
    ),
    /**
     * Người học không thi chứng chỉ đo trình độ bằng bài ba phần (từ vựng và
     * ngữ pháp, nghe, nói). Trang bài đo dẫn họ qua từng phần; khi chấm xong,
     * backend ghi trình độ và đẩy onboarding sang bước mục tiêu.
     */
    startLevelCheck: useCallback(async () => {
      setErrorMessage(null);
      try {
        await startLevelCheck({
          variables: { purpose: LevelCheckPurpose.ONBOARDING },
        });
        close();
        router.push("/study/level-check");
      } catch (error) {
        setErrorMessage(messageForError(error, isVi));
      }
    }, [startLevelCheck, close, router, isVi]),
  };
}
