"use client";

import {
  Alert,
  Button,
  CloseButton,
  Modal,
  Stack,
  Text,
  VisuallyHidden,
} from "@mantine/core";
import type { ReactNode } from "react";

import { useAccountProfile, type AccountProfile } from "@/features/account";
import { CertificateTargetStep } from "@/features/onboarding/components/blocks/CertificateTargetStep";
import { CurrentLevelStep } from "@/features/onboarding/components/blocks/CurrentLevelStep";
import { LearningGoalStep } from "@/features/onboarding/components/blocks/LearningGoalStep";
import { LearningPurposeStep } from "@/features/onboarding/components/blocks/LearningPurposeStep";
import { LearningPurposeStepSkeleton } from "@/features/onboarding/components/blocks/LearningPurposeStep/LearningPurposeStepSkeleton";
import { TargetSkillsStep } from "@/features/onboarding/components/blocks/TargetSkillsStep";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { useOnboardingActions } from "@/features/onboarding/hooks/useOnboardingActions";
import { OnboardingStep, TargetCertificate } from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useLearningPurposesQuery } from "@/lib/graphql/generated/hooks";

import classes from "./OnboardingGate.module.css";

type StepActions = ReturnType<typeof useOnboardingActions>;
type OnboardingState = NonNullable<AccountProfile>["onboardingState"];

/**
 * `targetCertificateType` về từ BFF là String (backend trả enum của miền user,
 * trùng giá trị nhưng không cùng enum GraphQL với chứng chỉ của đề thi). So
 * khớp với enum sinh ra thay vì ép kiểu, để một giá trị lạ thành "chưa chọn"
 * chứ không thành lựa chọn sai.
 */
function toTargetCertificate(value: string | null): TargetCertificate | null {
  return (
    Object.values(TargetCertificate).find((item) => item === value) ?? null
  );
}

/**
 * Bước nào đã có giao diện dựng xong. `OnboardingProvider` đã lọc bằng
 * `hasOnboardingStepUi` trước khi cho `opened` bật, nên tới đây `step` chắc
 * chắn khớp một case có giao diện thật - `switch` vẫn vét cạn để không quên
 * khi thêm bước mới.
 */
function renderOnboardingStep(
  step: OnboardingStep,
  state: OnboardingState,
  actions: StepActions,
): ReactNode | undefined {
  const { pending, errorMessage } = actions;

  switch (step) {
    case OnboardingStep.LEARNING_PURPOSES:
      return (
        <LearningPurposeStepContent
          pending={pending}
          errorMessage={errorMessage}
          onContinue={actions.submitLearningPurposes}
        />
      );
    case OnboardingStep.CERTIFICATE_TARGET:
      return (
        <CertificateTargetStep
          initialCertificate={toTargetCertificate(
            state?.targetCertificateType ?? null,
          )}
          pending={pending}
          errorMessage={errorMessage}
          onContinue={actions.submitCertificateTarget}
        />
      );
    case OnboardingStep.CURRENT_LEVEL:
      return (
        <CurrentLevelStep
          initialLevel={state?.currentLevel ?? null}
          pending={pending}
          errorMessage={errorMessage}
          onContinue={actions.submitCurrentLevel}
        />
      );
    case OnboardingStep.LEARNING_GOAL:
      return (
        <LearningGoalStep
          certificateLearner={state?.certificateLearner ?? false}
          initialCertificate={toTargetCertificate(
            state?.targetCertificateType ?? null,
          )}
          initialTargetScore={state?.targetScore ?? null}
          initialTargetDate={state?.targetDate ?? null}
          pending={pending}
          errorMessage={errorMessage}
          onContinue={actions.submitLearningGoal}
        />
      );
    case OnboardingStep.TARGET_SKILLS:
      return (
        <TargetSkillsStep
          initialSkills={state?.targetSkills ?? []}
          pending={pending}
          errorMessage={errorMessage}
          onFinish={actions.submitTargetSkills}
        />
      );
    case OnboardingStep.COMPLETED:
      return undefined;
  }
}

type LearningPurposeStepContentProps = {
  pending: boolean;
  errorMessage: string | null;
  onContinue: (purposeIds: number[]) => void;
};

function LearningPurposeStepContent({
  pending,
  errorMessage,
  onContinue,
}: LearningPurposeStepContentProps) {
  const { data, loading, error, refetch } = useLearningPurposesQuery();

  if (loading) {
    return <LearningPurposeStepSkeleton />;
  }

  if (error) {
    return (
      <Stack gap={16}>
        <Alert color="warn" title="Không tải được mục đích học">
          <Text size="sm">
            Kiểm tra lại kết nối rồi thử lần nữa. Bạn có thể để sau và thiết lập
            lại từ đầu.
          </Text>
        </Alert>
        <Button variant="default" onClick={() => refetch()}>
          Thử lại
        </Button>
      </Stack>
    );
  }

  const purposes = data?.learningPurposes ?? [];

  if (purposes.length === 0) {
    return (
      <Alert color="ink" title="Chưa có mục đích học nào">
        <Text size="sm">
          Danh sách đang trống. Vui lòng quay lại sau ít phút.
        </Text>
      </Alert>
    );
  }

  return (
    <LearningPurposeStep
      purposes={purposes}
      pending={pending}
      errorMessage={errorMessage}
      onContinue={onContinue}
    />
  );
}

/**
 * Popup onboarding, bật ở mọi trang. Điều kiện mở/đóng do
 * `OnboardingProvider` quyết định - Gate chỉ đọc và dựng đúng bước hiện tại.
 *
 * Gate là nơi duy nhất gọi mutation của onboarding: các bước là block, nhận
 * props và gọi callback chứ không tự đi lấy hay ghi dữ liệu.
 */
export function OnboardingGate() {
  const { profile } = useAccountProfile();
  const { opened, close } = useOnboarding();
  const actions = useOnboardingActions();

  const stepContent =
    opened && profile != null
      ? renderOnboardingStep(
          profile.onboardingStep,
          profile.onboardingState,
          actions,
        )
      : undefined;

  return (
    <Modal
      opened={opened}
      onClose={close}
      size={720}
      radius={20}
      centered
      padding={40}
      withCloseButton={false}
      overlayProps={{ color: "#0F1B3A", backgroundOpacity: 0.5 }}
      title={<VisuallyHidden>Thiết lập lộ trình học</VisuallyHidden>}
      classNames={{ header: classes.header, content: classes.content }}
    >
      <CloseButton
        onClick={close}
        aria-label="Đóng"
        radius={10}
        size={36}
        className={classes.closeButton}
      />
      {stepContent}
    </Modal>
  );
}
