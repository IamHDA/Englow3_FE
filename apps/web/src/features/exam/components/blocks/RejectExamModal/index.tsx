"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useState } from "react";

const MAX_NOTE_LENGTH = 2000;

type RejectExamModalProps = {
  /** Tên đề đang trả lại, null khi hộp thoại đang đóng. */
  examTitle: string | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => Promise<boolean | void> | boolean | void;
};

/**
 * Trả lại đề thì phải ghi lý do - backend từ chối ghi chú rỗng, và đúng như
 * vậy: chữ "bị trả lại" một mình không cho người viết biết phải sửa gì.
 *
 * Nút xác nhận bị khoá khi chưa nhập, nhưng đó chỉ là đỡ cho người dùng một
 * lần thất bại. Luật thật nằm ở entity phía backend.
 */
export function RejectExamModal({
  examTitle,
  submitting,
  onCancel,
  onConfirm,
}: RejectExamModalProps) {
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
      opened={examTitle !== null}
      onClose={handleClose}
      title={tr("Trả lại đề thi", "Return the exam")}
      radius="lg"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="ink.7">
          {isVi ? (
            <>
              Đề <strong>{examTitle}</strong> sẽ về trạng thái bị trả lại. Người
              viết sẽ thấy ghi chú này và sửa rồi gửi duyệt lại.
            </>
          ) : (
            <>
              <strong>{examTitle}</strong> goes back as returned. The author
              sees this note, fixes it and submits again.
            </>
          )}
        </Text>

        <Textarea
          label={tr("Lý do trả lại", "Reason")}
          description={tr(
            "Nói rõ phải sửa gì, ví dụ: Phần 3 chưa có file nghe.",
            "Say what to fix, for example: Part 3 has no audio file.",
          )}
          placeholder={tr(
            "Phần 3 chưa có file nghe.",
            "Part 3 has no audio file.",
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
            {tr("Trả lại đề", "Return exam")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
