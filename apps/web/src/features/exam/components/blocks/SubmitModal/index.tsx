'use client';

import React from 'react';
import {
  Button,
  Group,
  Modal,
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
  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="md" c="navy.9">
          Xác nhận nộp bài thi
        </Text>
      }
      centered
      radius="lg"
      padding="lg"
    >
      <Stack gap="md">
        {hasUnanswered ? (
          <Group gap="xs" p="sm" className={classes.warningBox}>
            <ThemeIcon color="warn" variant="light" size="md">
              <AlertTriangle size={18} />
            </ThemeIcon>
            <Text size="xs" c="warn.7" fw={600}>
              Bạn còn <b>{unansweredCount}</b> câu hỏi chưa trả lời!
            </Text>
          </Group>
        ) : (
          <Group gap="xs" p="sm" className={classes.successBox}>
            <ThemeIcon color="green" variant="light" size="md">
              <CheckCircle2 size={18} />
            </ThemeIcon>
            <Text size="xs" c="green.8" fw={600}>
              Bạn đã hoàn thành tất cả {totalQuestions} câu hỏi!
            </Text>
          </Group>
        )}

        {/* Stats Summary */}
        <SimpleGrid cols={3} spacing="xs">
          <Stack gap={2} align="center" p="xs" className={classes.statCard}>
            <CheckCircle2 size={18} color="var(--mantine-color-navy-9)" />
            <Text size="xs" c="ink.5">
              Đã làm
            </Text>
            <Text fw={700} size="sm" c="navy.9">
              {answeredCount}
            </Text>
          </Stack>

          <Stack gap={2} align="center" p="xs" className={classes.statCard}>
            <HelpCircle size={18} color={hasUnanswered ? 'var(--mantine-color-warn-6)' : 'gray'} />
            <Text size="xs" c="ink.5">
              Chưa làm
            </Text>
            <Text fw={700} size="sm" c={hasUnanswered ? 'warn.6' : 'navy.9'}>
              {unansweredCount}
            </Text>
          </Stack>

          <Stack gap={2} align="center" p="xs" className={classes.statCard}>
            <Flag size={18} color="#F59E0B" />
            <Text size="xs" c="ink.5">
              Gắn cờ
            </Text>
            <Text fw={700} size="sm" c="#92400E">
              {flaggedCount}
            </Text>
          </Stack>
        </SimpleGrid>

        <Text size="xs" c="ink.6">
          Sau khi xác nhận nộp bài, hệ thống sẽ kết thúc lượt thi và chuyển đến màn hình kết quả đánh giá cùng giải thích đáp án.
        </Text>

        <Group justify="flex-end" gap="xs" pt="sm">
          <Button variant="default" radius="xl" size="sm" onClick={onClose}>
            Tiếp tục làm bài
          </Button>
          <Button
            radius="xl"
            size="sm"
            onClick={onConfirmSubmit}
            className={classes.confirmBtn}
          >
            Xác nhận nộp bài
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
