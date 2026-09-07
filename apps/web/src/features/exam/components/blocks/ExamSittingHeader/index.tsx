'use client';

import React from 'react';
import {
  Box,
  Button,
  Flex,
  Group,
  Progress,
  Text,
} from '@mantine/core';
import { Clock, Send, AlertTriangle } from 'lucide-react';
import classes from './ExamSittingHeader.module.css';

export interface ExamSittingHeaderProps {
  title: string;
  sectionTitle: string;
  formattedTime: string;
  isWarning: boolean;
  isCritical: boolean;
  answeredCount: number;
  totalQuestions: number;
  onSubmitClick: () => void;
  onExitClick: () => void;
}

export function ExamSittingHeader({
  title,
  sectionTitle,
  formattedTime,
  isWarning,
  answeredCount,
  totalQuestions,
  onSubmitClick,
  onExitClick,
}: ExamSittingHeaderProps) {
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <Box className={classes.headerRoot}>
      <Box px={{ base: 'md', md: 'xl' }} py="xs">
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: 'column', sm: 'row' }}
          gap="sm"
        >
          {/* Left: Title and Section */}
          <Group gap="sm">
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={onExitClick}
              radius="xl"
            >
              Thoát
            </Button>
            <Box className={classes.divider} />
            <div>
              <Text fw={700} size="sm" c="navy.9" lineClamp={1}>
                {title}
              </Text>
              <Text size="xs" c="ink.5" fw={600}>
                {sectionTitle}
              </Text>
            </div>
          </Group>

          {/* Center: Live Timer */}
          <Group
            gap="xs"
            px="md"
            py={6}
            className={isWarning ? classes.timerWarning : classes.timerNormal}
          >
            {isWarning ? (
              <AlertTriangle size={16} color="var(--mantine-color-warn-6)" />
            ) : (
              <Clock size={16} color="var(--mantine-color-navy-9)" />
            )}
            <Text
              fw={700}
              size="sm"
              c={isWarning ? 'warn.6' : 'navy.9'}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formattedTime}
            </Text>
          </Group>

          {/* Right: Progress and Submit CTA */}
          <Group gap="md">
            <Box style={{ width: 140 }}>
              <Flex justify="space-between" mb={2}>
                <Text size="xs" c="ink.5" fw={600}>
                  Tiến độ
                </Text>
                <Text size="xs" fw={700} c="navy.9">
                  {answeredCount}/{totalQuestions}
                </Text>
              </Flex>
              <Progress value={progressPercent} size="xs" color="navy.9" radius="xl" />
            </Box>

            <Button
              onClick={onSubmitClick}
              radius="xl"
              size="sm"
              rightSection={<Send size={14} />}
              className={classes.submitBtn}
            >
              Nộp bài
            </Button>
          </Group>
        </Flex>
      </Box>
    </Box>
  );
}
