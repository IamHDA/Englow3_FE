"use client";

import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useState } from "react";

const MAX_NOTE_LENGTH = 2000;

type RejectContentModalProps = {
  /** Tên mục đang trả lại, null khi hộp thoại đang đóng. */
  itemTitle: string | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => void;
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
  const [note, setNote] = useState("");
  const trimmed = note.trim();

  function handleClose() {
    setNote("");
    onCancel();
  }

  return (
    <Modal
      opened={itemTitle !== null}
      onClose={handleClose}
      title="Trả lại nội dung"
      radius="lg"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="ink.7">
          <strong>{itemTitle}</strong> sẽ về trạng thái bị trả lại. Người soạn
          thấy ghi chú này, sửa rồi gửi duyệt lại.
        </Text>

        <Textarea
          label="Lý do trả lại"
          description="Nói rõ phải sửa gì, ví dụ: Mười hai thẻ chưa có file phát âm."
          placeholder="Mười hai thẻ chưa có file phát âm."
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
            Trả lại
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
