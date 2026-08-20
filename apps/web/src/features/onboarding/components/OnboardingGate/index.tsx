"use client";

import {
  Alert,
  Button,
  Modal,
  Stack,
  Text,
  VisuallyHidden,
} from "@mantine/core";
import { useState } from "react";

import { useAccountProfile } from "@/features/account";
import { LearningPurposeStep } from "@/features/onboarding/components/blocks/LearningPurposeStep";
import { LearningPurposeStepSkeleton } from "@/features/onboarding/components/blocks/LearningPurposeStep/LearningPurposeStepSkeleton";
import { OnboardingStep } from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useLearningPurposesQuery } from "@/lib/graphql/generated/hooks";

import classes from "./OnboardingGate.module.css";

/**
 * Mở bước onboarding cho người đã đăng nhập mà chưa đi hết luồng.
 *
 * `onboardingStep` đã nằm sẵn trong query `CurrentUser` nên không phải hỏi BFF
 * thêm lần nào chỉ để biết có cần mở hay không.
 */
export function OnboardingGate() {
  const { profile } = useAccountProfile();
  const [dismissed, setDismissed] = useState(false);

  // Suy ra chứ không đặt bằng effect: chưa đăng nhập thì `profile` là null nên
  // modal không bao giờ bật, và cũng không cần chặn đăng nhập riêng ở đây.
  const needsOnboarding =
    profile != null && profile.onboardingStep !== OnboardingStep.COMPLETED;
  const opened = needsOnboarding && !dismissed;

  // `skip` thay cho việc gọi trong useEffect: không tải danh sách cho người chỉ
  // ghé trang chủ, mà cũng không phải tự đồng bộ vòng đời fetch bằng tay.
  const { data, loading, error, refetch } = useLearningPurposesQuery({
    skip: !opened,
  });

  function handleClose() {
    setDismissed(true);
  }

  function handleContinue(selectedIds: number[]) {
    // Gửi lên BFF là việc của lần sau - BFF chưa có mutation nào. Đóng lại để
    // người dùng không kẹt trước một nút bấm không phản hồi.
    console.warn("Chưa gửi lựa chọn lên BFF (chưa có mutation)", selectedIds);
    handleClose();
  }

  const purposes = data?.learningPurposes ?? [];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size={720}
      radius={20}
      centered
      padding={40}
      withCloseButton={false}
      overlayProps={{ color: "#0F1B3A", backgroundOpacity: 0.5 }}
      title={<VisuallyHidden>Thiết lập lộ trình học</VisuallyHidden>}
      classNames={{ header: classes.header }}
    >
      {loading ? (
        <LearningPurposeStepSkeleton onBack={handleClose} />
      ) : error ? (
        <Stack gap={16}>
          <Alert color="warn" title="Không tải được mục đích học">
            <Text size="sm">
              Kiểm tra lại kết nối rồi thử lần nữa. Bạn có thể bỏ qua và thiết
              lập sau.
            </Text>
          </Alert>
          <Button variant="default" onClick={() => refetch()}>
            Thử lại
          </Button>
        </Stack>
      ) : purposes.length === 0 ? (
        <Alert color="ink" title="Chưa có mục đích học nào">
          <Text size="sm">
            Danh sách đang trống. Vui lòng quay lại sau ít phút.
          </Text>
        </Alert>
      ) : (
        <LearningPurposeStep
          purposes={purposes}
          onBack={handleClose}
          onContinue={handleContinue}
        />
      )}
    </Modal>
  );
}
