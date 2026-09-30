"use client";

import { Badge, Group, Progress, Stack, Text } from "@mantine/core";
import { Award, Flame, Pause, Volume2 } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeMocks.module.css";

/*
 * Small, static pictures of the product built from its own components - what
 * a visitor will actually see, where the old page had a cartoon. The content
 * in them is sample content, not figures about anyone.
 */

export function FlashcardMock() {
  const { t } = useLanguage();
  return (
    <div className={classes.panel}>
      <Group justify="space-between">
        <Badge color="navy">B2</Badge>
        <Text size="xs" c="ink.5">
          {t.home.mockCardsDue}
        </Text>
      </Group>
      <Stack gap={4} align="center" className={classes.flashcardFace}>
        <Text className={classes.word}>acquire</Text>
        <Text size="sm" c="ink.5">
          /əˈkwaɪər/
        </Text>
        <Text size="sm" c="ink.8" fw={600}>
          {t.home.mockAcquireDefinition}
        </Text>
      </Stack>
      <div className={classes.rateRow}>
        <span data-tone="warn">{t.home.mockRatingAgain}</span>
        <span data-tone="navy">{t.home.mockRatingGood}</span>
        <span data-tone="teal">{t.home.mockRatingEasy}</span>
      </div>
    </div>
  );
}

export function DictationMock() {
  const { t } = useLanguage();
  return (
    <div className={classes.panel}>
      <Group gap="sm" wrap="nowrap">
        <span className={classes.play}>
          <Pause size={16} aria-hidden="true" />
        </span>
        <div className={classes.wave} aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} style={{ height: `${20 + ((i * 37) % 70)}%` }} />
          ))}
        </div>
        <Volume2
          size={16}
          color="var(--mantine-color-ink-4)"
          aria-hidden="true"
        />
      </Group>
      <Text size="xs" c="ink.5" mt="md">
        {t.home.mockYouTyped}
      </Text>
      <Text className={classes.sentence}>
        The meeting has been <mark data-kind="wrong">move</mark>{" "}
        <mark data-kind="fix">moved</mark> to Thursday morning.
      </Text>
      <Group justify="space-between" mt="sm">
        <Text size="xs" c="ink.5">
          {t.dictation.accuracyScore}
        </Text>
        <Text size="sm" fw={700} c="teal.7">
          86%
        </Text>
      </Group>
      <Progress value={86} color="teal" size="sm" radius="xl" />
    </div>
  );
}

export function ExamResultMock() {
  const { t } = useLanguage();
  const sections = [
    { label: "Listening", score: "7.5", value: 83 },
    { label: "Reading", score: "7.0", value: 78 },
    { label: "Writing", score: "6.5", value: 72 },
  ];
  return (
    <div className={classes.panel}>
      <Group justify="space-between" align="flex-start">
        <Stack gap={2}>
          <Text size="xs" c="ink.5">
            IELTS Academic · Test 05
          </Text>
          <Text fw={700} c="navy.9">
            {t.home.mockResultLabel}
          </Text>
        </Stack>
        <div className={classes.band}>
          <Text className={classes.bandValue}>7.0</Text>
          <Text size="xs" c="ink.5">
            Overall
          </Text>
        </div>
      </Group>
      <Stack gap={10} mt="md">
        {sections.map((section) => (
          <Stack key={section.label} gap={4}>
            <Group justify="space-between">
              <Text size="sm" c="ink.7">
                {section.label}
              </Text>
              <Text size="sm" fw={700} c="navy.9">
                {section.score}
              </Text>
            </Group>
            <Progress
              value={section.value}
              color="navy"
              size="sm"
              radius="xl"
            />
          </Stack>
        ))}
      </Stack>
    </div>
  );
}

export function StreakChip() {
  const { t } = useLanguage();
  return (
    <div className={classes.chip}>
      <Flame
        size={18}
        color="var(--mantine-color-orange-6)"
        aria-hidden="true"
      />
      <Text size="sm" fw={700} c="ink.8">
        {t.home.mockStreakLabel}
      </Text>
    </div>
  );
}

export function DeckListMock() {
  const { t } = useLanguage();
  const decks = [
    { name: "Core vocabulary B1", level: "B1", done: 72, due: 8 },
    { name: "Core vocabulary B2", level: "B2", done: 38, due: 15 },
    { name: "Core vocabulary C1", level: "C1", done: 12, due: 4 },
  ];
  return (
    <div className={classes.panel}>
      <Stack gap={14}>
        {decks.map((deck) => (
          <Stack key={deck.name} gap={6}>
            <Group justify="space-between" wrap="nowrap">
              <Group gap={8} wrap="nowrap">
                <Badge color="navy">{deck.level}</Badge>
                <Text size="sm" fw={600} c="ink.8" truncate>
                  {deck.name}
                </Text>
              </Group>
              <Text size="xs" c="orange.7" fw={700}>
                {t.home.mockDueSuffix.replace("{count}", String(deck.due))}
              </Text>
            </Group>
            <Progress value={deck.done} color="teal" size="sm" radius="xl" />
          </Stack>
        ))}
      </Stack>
    </div>
  );
}

export function ScoreChip() {
  return (
    <div className={classes.chip}>
      <Award size={18} color="var(--mantine-color-navy-7)" aria-hidden="true" />
      <Text size="sm" fw={700} c="ink.8">
        IELTS 7.0
      </Text>
    </div>
  );
}
