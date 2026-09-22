"use client";

import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useState } from "react";

const MAX_NOTE_LENGTH = 2000;

type RejectExamModalProps = {
  /** Tên đề đang trả lại, null khi hộp thoại đang đóng. */
  examTitle: string | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => void;
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
  const [note, setNote] = useState("");
  const trimmed = note.trim();

  function handleClose() {
    setNote("");
    onCancel();
  }

  return (
    <Modal
      opened={examTitle !== null}
      onClose={handleClose}
      title="Trả lại đề thi"
      radius="lg"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="ink.7">
          Đề <strong>{examTitle}</strong> sẽ về trạng thái bị trả lại. Người
          viết sẽ thấy ghi chú này và sửa rồi gửi duyệt lại.
        </Text>

        <Textarea
          label="Lý do trả lại"
          description="Nói rõ phải sửa gì, ví dụ: Phần 3 chưa có file nghe."
          placeholder="Phần 3 chưa có file nghe."
          value={note}
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
            Huỷ
          </Button>
          <Button
            radius="md"
            color="yellow"
            disabled={trimmed === ""}
            loading={submitting}
            onClick={() => {
              onConfirm(trimmed);
              setNote("");
            }}
          >
            Trả lại đề
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
