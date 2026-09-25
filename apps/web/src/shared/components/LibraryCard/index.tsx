"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  type MantineColor,
} from "@mantine/core";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import classes from "./LibraryCard.module.css";

export type LibraryCardMeta = {
  icon: ReactNode;
  label: string;
};

type LibraryCardAction = {
  label: string;
  href: string;
};

type LibraryCardProps = {
  /** What kind of thing this is - a topic, a certificate, a category. */
  eyebrow: string;
  /** A CEFR level or similar, beside the eyebrow. */
  level?: string | null;
  status?: { label: string; color: MantineColor };
  title: string;
  meta?: LibraryCardMeta[];
  progress?: { value: number; label: string; color?: MantineColor };
  action: LibraryCardAction & {
    /** "continue" is the orange call to move on; the default is navy. */
    emphasis?: "continue" | "default";
  };
  secondaryAction?: LibraryCardAction;
};

/**
 * One card for every library: exams, flashcard sets, dictation lessons,
 * pronunciation prompts and quizzes. Each used to draw its own - different
 * padding, badges, button sizes and heights - so a row of cards never lined
 * up across pages, and sometimes not within one. Same slots, same order:
 * what it is, its title (always two lines' room), a few facts, how far the
 * learner is, and what to do.
 */
export function LibraryCard({
  eyebrow,
  level,
  status,
  title,
  meta = [],
  progress,
  action,
  secondaryAction,
}: LibraryCardProps) {
  return (
    <Card className={classes.card}>
      <Stack gap="sm" className={classes.body}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap={6} wrap="nowrap" miw={0}>
            <Text className={classes.eyebrow} truncate>
              {eyebrow}
            </Text>
            {level && (
              <Badge size="sm" color="navy" variant="outline">
                {level}
              </Badge>
            )}
          </Group>
          {status && (
            <Badge size="sm" color={status.color} className={classes.status}>
              {status.label}
            </Badge>
          )}
        </Group>

        <Text className={classes.title} lineClamp={2} title={title}>
          {title}
        </Text>

        {meta.length > 0 && (
          <Group gap="md" className={classes.meta}>
            {meta.map((item) => (
              <Group key={item.label} gap={5} wrap="nowrap">
                {item.icon}
                <span>{item.label}</span>
              </Group>
            ))}
          </Group>
        )}
      </Stack>

      <Stack gap="sm" mt="md">
        {progress && (
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="ink.6">
                {progress.label}
              </Text>
              <Text size="xs" fw={700} c="navy.8">
                {Math.round(progress.value)}%
              </Text>
            </Group>
            <Progress
              value={progress.value}
              color={progress.color ?? "teal"}
              size="sm"
              radius="xl"
            />
          </Stack>
        )}

        <Group gap="xs" wrap="nowrap">
          {secondaryAction && (
            <Button
              component={Link}
              href={secondaryAction.href}
              variant="default"
              className={classes.secondary}
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            component={Link}
            href={action.href}
            color={action.emphasis === "continue" ? "orange.5" : "navy"}
            rightSection={<ArrowRight size={16} aria-hidden="true" />}
            className={classes.primary}
          >
            {action.label}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
