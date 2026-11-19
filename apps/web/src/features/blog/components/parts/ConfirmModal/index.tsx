"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

type ConfirmModalProps = {
  opened: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  /** The confirm button spins and both are disabled while the thing is being done. */
  loading?: boolean;
  /** Red, for what cannot be taken back. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** "Are you sure?" for what takes something away or leaves a page with work on it. Closing it any other way is the cancel. */
export function ConfirmModal({
  opened,
  title,
  body,
  confirmLabel,
  cancelLabel,
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={title}
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
    >
      <Text size="sm" c="ink.7">
        {body}
      </Text>
      <Group justify="flex-end" mt="lg" gap="sm">
        <Button variant="default" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          color={danger ? "warn" : undefined}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
