"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

type RecallModalProps = {
  opened: boolean;
  /** The recall is running. */
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** "Are you sure?" for taking a message back: it disappears for both people, and cannot be restored. */
export function RecallModal({
  opened,
  loading,
  onConfirm,
  onCancel,
}: RecallModalProps) {
  const copy = useLanguage().t.chat.message;
  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (!loading) onCancel();
      }}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
      title={copy.recallTitle}
    >
      <Text size="sm" c="ink.7">
        {copy.recallBody}
      </Text>
      <Group justify="flex-end" mt="lg" gap="sm">
        <Button variant="default" disabled={loading} onClick={onCancel}>
          {copy.recallCancel}
        </Button>
        <Button color="warn" loading={loading} onClick={onConfirm}>
          {copy.recallConfirm}
        </Button>
      </Group>
    </Modal>
  );
}
