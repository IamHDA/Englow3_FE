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

import { useAccountProfile } from "@/features/account";
import { LearningPurposeStep } from "@/features/onboarding/components/blocks/LearningPurposeStep";
import { LearningPurposeStepSkeleton } from "@/features/onboarding/components/blocks/LearningPurposeStep/LearningPurposeStepSkeleton";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { OnboardingStep } from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useLearningPurposesQuery } from "@/lib/graphql/generated/hooks";

import classes from "./OnboardingGate.module.css";

/**
 * Bước nào đã có giao diện dựng xong. `OnboardingProvider` đã lọc bằng
 * `hasOnboardingStepUi` trước khi cho `opened` bật, nên tới đây `step` chắc
 * chắn khớp một case có giao diện thật - `switch` vẫn vét cạn để không quên
 * khi thêm bước mới.
 */
function renderOnboardingStep(step: OnboardingStep): ReactNode | null {
  switch (step) {
    case OnboardingStep.LEARNING_PURPOSES:
      return <LearningPurposeStepContent />;
    case OnboardingStep.CERTIFICATE_TARGET:
    case OnboardingStep.CURRENT_LEVEL:
    case OnboardingStep.LEARNING_GOAL:
    case OnboardingStep.TARGET_SKILLS:
    case OnboardingStep.COMPLETED:
      return null;
  }
}

function LearningPurposeStepContent() {
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

  return <LearningPurposeStep purposes={purposes} />;
}

/**
 * Popup onboarding, bật ở mọi trang. Điều kiện mở/đóng do
 * `OnboardingProvider` quyết định - Gate chỉ đọc và dựng đúng bước hiện tại.
 */
export function OnboardingGate() {
  const { profile } = useAccountProfile();
  const { opened, close } = useOnboarding();

  const stepContent =
    opened && profile != null
      ? renderOnboardingStep(profile.onboardingStep)
      : null;

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
