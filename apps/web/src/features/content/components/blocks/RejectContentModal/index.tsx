"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useState } from "react";

const MAX_NOTE_LENGTH = 2000;

type RejectContentModalProps = {
  /** Tên mục đang trả lại, null khi hộp thoại đang đóng. */
  itemTitle: string | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => Promise<boolean | void> | boolean | void;
};

/**
 * Trả lại thì phải ghi lý do - backend từ chối ghi chú rỗng, và đúng như vậy:
 * chữ "bị trả lại" một mình không cho người soạn biết phải sửa gì.
 *
 * Nút xác nhận bị khoá khi chưa nhập, nhưng đó chỉ là đỡ cho người dùng một
 * lần thất bại. Luật thật nằm ở entity phía backend.
 */
export function RejectContentModal({
  itemTitle,
  submitting,
  onCancel,
  onConfirm,
}: RejectContentModalProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const [note, setNote] = useState("");
  const trimmed = note.trim();

  function handleClose() {
    if (submitting) return;
    setNote("");
    onCancel();
  }

  return (
    <Modal
      opened={itemTitle !== null}
      onClose={handleClose}
      title={tr("Trả lại nội dung", "Return content")}
      radius="lg"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="ink.7">
          <strong>{itemTitle}</strong>{" "}
          {tr(
            "sẽ về trạng thái bị trả lại. Người soạn thấy ghi chú này, sửa rồi gửi duyệt lại.",
            "goes back to its author, who sees this note, fixes it and submits again.",
          )}
        </Text>

        <Textarea
          label={tr("Lý do trả lại", "Reason")}
          description={tr(
            "Nói rõ phải sửa gì, ví dụ: Mười hai thẻ chưa có file phát âm.",
            "Say what to fix, e.g. Twelve cards have no audio.",
          )}
          placeholder={tr(
            "Mười hai thẻ chưa có file phát âm.",
            "Twelve cards have no audio.",
          )}
          value={note}
          disabled={submitting}
          onChange={(event) => setNote(event.currentTarget.value)}
          maxLength={MAX_NOTE_LENGTH}
          autosize
          minRows={3}
          maxRows={8}
          withAsterisk
          data-autofocus
        />

        <Group justify="flex-end">
          <Button variant="default" radius="md" onClick={handleClose}>
            {tr("Huỷ", "Cancel")}
          </Button>
          <Button
            radius="md"
            color="yellow"
            disabled={trimmed === ""}
            loading={submitting}
            onClick={async () => {
              const succeeded = await onConfirm(trimmed);
              if (succeeded === true) setNote("");
            }}
          >
            {tr("Trả lại", "Return")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
