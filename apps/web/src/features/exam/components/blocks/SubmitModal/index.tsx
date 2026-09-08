'use client';

import React from 'react';
import {
  Button,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Flag,
} from 'lucide-react';
import { useLanguage } from '@/shared/hooks/useLanguage';
import classes from './SubmitModal.module.css';

export interface SubmitModalProps {
  opened: boolean;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  onClose: () => void;
  onConfirmSubmit: () => void;
}

export function SubmitModal({
  opened,
  totalQuestions,
  answeredCount,
  flaggedCount,
  onClose,
  onConfirmSubmit,
}: SubmitModalProps) {
  const { t } = useLanguage();
  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="md" c="navy.9">
          {t.exam.confirmModalTitle}
        </Text>
      }
      centered
      radius="lg"
      padding="lg"
    >
      <Stack gap="md">
        {hasUnanswered ? (
          <Paper p="sm" radius="md" bg="orange.0" withBorder>
            <Group gap="xs">
              <ThemeIcon color="orange" variant="light" size="md">
                <AlertTriangle size={18} />
              </ThemeIcon>
              <Text size="xs" c="orange.9" fw={600}>
                {t.exam.unansweredWarning.replace('{count}', String(unansweredCount))}
              </Text>
            </Group>
          </Paper>
        ) : (
          <Paper p="sm" radius="md" bg="teal.0" withBorder>
            <Group gap="xs">
              <ThemeIcon color="teal" variant="light" size="md">
                <CheckCircle2 size={18} />
              </ThemeIcon>
              <Text size="xs" c="teal.9" fw={600}>
                {t.exam.allDoneNotice.replace('{count}', String(totalQuestions))}
              </Text>
            </Group>
          </Paper>
        )}

        {/* Stats Summary */}
        <SimpleGrid cols={3} spacing="xs">
          <Paper p="xs" radius="md" withBorder bg="gray.0">
            <Stack gap={2} align="center">
              <CheckCircle2 size={18} color="var(--mantine-color-navy-9)" />
              <Text size="xs" c="ink.5">
                {t.exam.legendAnswered}
              </Text>
              <Text fw={700} size="sm" c="navy.9">
                {answeredCount}
              </Text>
            </Stack>
          </Paper>

          <Paper p="xs" radius="md" withBorder bg="gray.0">
            <Stack gap={2} align="center">
              <HelpCircle size={18} color={hasUnanswered ? 'var(--mantine-color-warn-6)' : 'gray'} />
              <Text size="xs" c="ink.5">
                {t.exam.legendUnanswered}
              </Text>
              <Text fw={700} size="sm" c={hasUnanswered ? 'orange.8' : 'navy.9'}>
                {unansweredCount}
              </Text>
            </Stack>
          </Paper>

          <Paper p="xs" radius="md" withBorder bg="gray.0">
            <Stack gap={2} align="center">
              <Flag size={18} color="#F59E0B" />
              <Text size="xs" c="ink.5">
                {t.exam.legendFlagged}
              </Text>
              <Text fw={700} size="sm" c="yellow.9">
                {flaggedCount}
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        <Text size="xs" c="ink.6">
          {t.exam.submitExplanation}
        </Text>

        <Group justify="flex-end" gap="xs" pt="sm">
          <Button variant="default" radius="xl" size="sm" onClick={onClose}>
            {t.exam.continueDoing}
          </Button>
          <Button
            radius="xl"
            size="sm"
            onClick={onConfirmSubmit}
            className={classes.confirmBtn}
          >
            {t.exam.confirmSubmitCTA}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
