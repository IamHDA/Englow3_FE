"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

import { CONFIRM_COPY } from "../../../constants/friends";
import type { RelationshipConfirmation } from "../../../types";

type RelationshipConfirmModalProps = {
  /** What is being asked, or null while nothing is. */
  confirming: RelationshipConfirmation | null;
  /** The confirmed action is running. */
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** "Are you sure?" for the two actions that take something away: unfriending and blocking. */
export function RelationshipConfirmModal({
  confirming,
  loading,
  onConfirm,
  onCancel,
}: RelationshipConfirmModalProps) {
  if (!confirming) return null;
  const copy = CONFIRM_COPY[confirming.kind];

  return (
    <Modal
      opened
      onClose={() => {
        if (!loading) onCancel();
      }}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
      title={copy.title.replace("{name}", confirming.target.displayName)}
    >
      <Text size="sm" c="ink.7">
        {copy.body}
      </Text>
      <Group justify="flex-end" mt="lg" gap="sm">
        <Button variant="default" disabled={loading} onClick={onCancel}>
          {copy.cancelLabel}
        </Button>
        <Button color="warn" loading={loading} onClick={onConfirm}>
          {copy.confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
