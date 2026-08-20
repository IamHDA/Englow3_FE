"use client";

import {
  Alert,
  Button,
  Modal,
  Stack,
  Text,
  VisuallyHidden,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAccountProfile } from "@/features/account";
import { LearningPurposeStep } from "@/features/onboarding/components/blocks/LearningPurposeStep";
import { LearningPurposeStepSkeleton } from "@/features/onboarding/components/blocks/LearningPurposeStep/LearningPurposeStepSkeleton";
import { OnboardingStep } from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useLearningPurposesQuery } from "@/lib/graphql/generated/hooks";

import classes from "./OnboardingGate.module.css";

/**
 * Luồng xác thực (login, callback, đặt lại mật khẩu). Link đặt lại mật khẩu
 * của Supabase tạo sẵn phiên đăng nhập, nên không trừ nhóm này thì popup sẽ đè
 * lên form đặt mật khẩu mới giữa chừng.
 */
const AUTH_PATH_PREFIX = "/auth";

/**
 * Bước nào đã có giao diện dựng xong. Bốn bước còn lại của
 * `ONBOARDING_STEP_ORDER` chưa có component nên trả `null` - popup không mở
 * cho các bước đó, vì mở một popup bắt buộc mà rỗng thì người dùng kẹt cứng
 * không lối ra.
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
 * Mở popup onboarding ở mọi trang cho người đã đăng nhập mà chưa đi hết luồng.
 *
 * `onboardingStep` đã nằm sẵn trong query `CurrentUser` nên không phải hỏi BFF
 * thêm lần nào chỉ để biết có cần mở hay không.
 */
export function OnboardingGate() {
  const { profile } = useAccountProfile();
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith(AUTH_PATH_PREFIX);
  const step = profile?.onboardingStep ?? null;
  const stepContent =
    profile != null &&
    !isAuthRoute &&
    step != null &&
    step !== OnboardingStep.COMPLETED
      ? renderOnboardingStep(step)
      : null;
  const opened = stepContent != null;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        // Bắt buộc: không có lối đóng nào ở luồng bình thường. Nhánh lỗi bên
        // trong từng bước tự có nút riêng để thoát khi BFF sập.
      }}
      closeOnEscape={false}
      closeOnClickOutside={false}
      withCloseButton={false}
      size={720}
      radius={20}
      centered
      padding={40}
      overlayProps={{ color: "#0F1B3A", backgroundOpacity: 0.5 }}
      title={<VisuallyHidden>Thiết lập lộ trình học</VisuallyHidden>}
      classNames={{ header: classes.header }}
    >
      {stepContent}
    </Modal>
  );
}
