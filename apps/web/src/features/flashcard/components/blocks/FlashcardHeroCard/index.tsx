"use client";

import {
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBrain,
  IconCalendarTime,
  IconFlame,
  IconPlayerPlay,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface FlashcardHeroCardProps {
  dueCount: number;
  /**
   * Null until the stats have been loaded - they are fetched for the stats tab
   * only. Shown as 0 they read as "you have no streak", which may be false.
   */
  streakDays: number | null;
  retentionPercent: number | null;
  primarySetId: string;
}

export function FlashcardHeroCard({
  dueCount,
  streakDays,
  retentionPercent,
  primarySetId,
}: FlashcardHeroCardProps) {
  const { t } = useLanguage();

  return (
    <Card
      withBorder
      padding="xl"
      radius="lg"
      style={{
        background: "linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)",
        color: "#ffffff",
      }}
    >
      <Grid align="center" gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="sm">
            {streakDays !== null && streakDays > 0 && (
              <Group gap={4}>
                <IconFlame size={18} color="#FDE047" />
                <Text fz="xs" fw={700} c="yellow.2">
                  {t.flashcard.streakDaysBanner.replace(
                    "{count}",
                    String(streakDays),
                  )}
                </Text>
              </Group>
            )}

            <Text fz={{ base: 22, sm: 26 }} fw={800} lh={1.2}>
              {dueCount > 0
                ? t.flashcard.cardsDueTodayMessage.replace(
                    "{count}",
                    String(dueCount),
                  )
                : t.flashcard.nothingDueTodayMessage}
            </Text>

            <Group mt="xs">
              {/* Không có bộ nào thì slug rỗng và link thành
                  /study/flashcards//study - một trang lỗi. Nói rõ lý do thay vì
                  dẫn tới đó. */}
              {primarySetId ? (
                <Button
                  component={Link}
                  href={`/study/flashcards/${primarySetId}/study`}
                  size="md"
                  variant="white"
                  color="indigo"
                  radius="md"
                  fw={700}
                  leftSection={<IconPlayerPlay size={18} />}
                >
                  {dueCount > 0
                    ? t.flashcard.startReviewCount.replace(
                        "{count}",
                        String(dueCount),
                      )
                    : t.flashcard.learnNewCardsButton}
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="white"
                  color="indigo"
                  radius="md"
                  fw={700}
                  disabled
                >
                  {t.flashcard.noSetsToStudyButton}
                </Button>
              )}
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack
            gap="xs"
            p="md"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(8px)",
              borderRadius: "var(--mantine-radius-md)",
            }}
          >
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="white" color="indigo" size="sm" radius="xl">
                  <IconCalendarTime size={14} />
                </ThemeIcon>
                <Text fz="xs" fw={600} c="white">
                  {t.flashcard.dueTodayLabel}
                </Text>
              </Group>
              <Text fz="sm" fw={800} c="white">
                {dueCount} {t.flashcard.cardsUnit}
              </Text>
            </Group>

            {retentionPercent !== null && (
              <Group justify="space-between">
                <Group gap="xs">
                  <ThemeIcon
                    variant="white"
                    color="indigo"
                    size="sm"
                    radius="xl"
                  >
                    <IconBrain size={14} />
                  </ThemeIcon>
                  <Text fz="xs" fw={600} c="white">
                    {t.flashcard.retentionRateLabel}
                  </Text>
                </Group>
                <Text fz="sm" fw={800} c="white">
                  {retentionPercent}%
                </Text>
              </Group>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
