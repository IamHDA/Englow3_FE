"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Progress,
  Pagination,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBook,
  IconClock,
  IconPlayerPlay,
  IconVolume,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FlashcardReviewStatus } from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useFlashcardSetDetailQuery } from "@/lib/graphql/generated/hooks";
import { FlashcardStudySkeleton } from "../../blocks/FlashcardStudySkeleton";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";
import { masteredPercent as computeMasteredPercent } from "../../../setProgress";
import { learnerSetDescription } from "../../../setDescription";
import { abbreviatePartOfSpeech } from "../../../partOfSpeech";

interface FlashcardSetDetailViewProps {
  setId: string;
}

export function FlashcardSetDetailView({ setId }: FlashcardSetDetailViewProps) {
  const { isVi, t } = useLanguage();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFlashcardSetDetailQuery({
    variables: { id: setId, page: page - 1, size: 30 },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) {
    return <FlashcardStudySkeleton />;
  }

  if (error || !data) {
    return (
      <Page>
        <LoadErrorState
          error={error}
          thing={{ vi: "bộ thẻ", en: "deck" }}
          back={{
            href: "/study/flashcards",
            label: t.flashcard.backToDecksButton,
          }}
          onRetry={() => void refetch().catch(() => undefined)}
        />
      </Page>
    );
  }

  const set = data.flashcardSet.set;
  const description = learnerSetDescription(set.description);
  const cards = data.flashcardSet.cards;
  const masteredPercent = computeMasteredPercent(set);
  const lastStudiedLabel = set.lastStudiedAt
    ? new Date(set.lastStudiedAt).toLocaleDateString(isVi ? "vi-VN" : "en-GB")
    : t.flashcard.notStudiedYet;

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    window.speechSynthesis.speak(utt);
  };

  return (
    <Page>
      <Stack gap="xl">
        {/* Navigation & Header */}
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href="/study/flashcards"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={18} />}
          >
            {t.flashcard.backToDecksButton}
          </Button>

          <Button
            component={Link}
            href={`/study/flashcards/${set.id}/study`}
            size="md"
            variant="filled"
            color="indigo"
            radius="md"
            leftSection={<IconPlayerPlay size={18} />}
          >
            {t.flashcard.studyDeckNowButton}
          </Button>
        </Group>

        {/* Set Info Header Card */}
        <Card withBorder padding="xl" radius="lg">
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge variant="filled" color="indigo" size="md">
                    {set.topic}
                  </Badge>
                  <Badge
                    variant={set.dueCount > 0 ? "filled" : "light"}
                    color={
                      set.dueCount > 0
                        ? "orange"
                        : set.lastStudiedAt
                          ? "teal"
                          : "gray"
                    }
                    size="sm"
                    role="status"
                  >
                    {set.dueCount > 0
                      ? t.flashcard.cardsDueTodayBadge.replace(
                          "{count}",
                          String(set.dueCount),
                        )
                      : set.lastStudiedAt
                        ? t.flashcard.nothingDueTodayMessage
                        : t.flashcard.notStudiedYet}
                  </Badge>
                </Group>
                <Title order={2} fw={700} c="dark.9">
                  {set.name}
                </Title>
              </Stack>
            </Group>

            {description && (
              <Text fz="sm" c="dimmed">
                {description}
              </Text>
            )}

            <Group gap="xl" mt="xs">
              <Group gap="xs">
                <IconBook size={16} color="var(--mantine-color-indigo-6)" />
                <Text fz="sm">
                  {t.flashcard.totalCardsLabel}{" "}
                  <b>
                    {set.cardCount} {t.flashcard.cardsUnit}
                  </b>
                </Text>
              </Group>
              <Group gap="xs">
                <IconClock size={16} color="var(--mantine-color-blue-6)" />
                <Text fz="sm">
                  {t.flashcard.lastStudiedLabel} <b>{lastStudiedLabel}</b>
                </Text>
              </Group>
              <Box style={{ flex: 1, maxWidth: 240 }}>
                <Group justify="space-between" mb={2}>
                  <Text fz="xs" c="dimmed">
                    {t.flashcard.masteredColonLabel}
                  </Text>
                  <Text fz="xs" fw={700} c="indigo">
                    {masteredPercent}%
                  </Text>
                </Group>
                <Progress
                  aria-label={isVi ? "Thẻ đã thuộc" : "Cards mastered"}
                  value={masteredPercent}
                  color="indigo"
                  size="sm"
                  radius="xl"
                />
              </Box>
            </Group>
          </Stack>
        </Card>

        {/* Card List Table */}
        <Card withBorder padding="md" radius="md">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={700} fz="md" c="dark.9">
                {t.flashcard.deckWordListTitle.replace(
                  "{count}",
                  String(set.cardCount),
                )}
              </Text>
              <Text fz="xs" c="dimmed">
                {t.flashcard.clickSpeakerHint}
              </Text>
            </Group>

            <Table.ScrollContainer minWidth={900}>
              <Table
                verticalSpacing="sm"
                horizontalSpacing="md"
                highlightOnHover
                styles={{ td: { verticalAlign: "top" } }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t.dictation.wordColumn}</Table.Th>
                    <Table.Th>{t.flashcard.ipaColumn}</Table.Th>
                    <Table.Th>{t.flashcard.partOfSpeechColumn}</Table.Th>
                    <Table.Th>{t.flashcard.definitionColumn}</Table.Th>
                    <Table.Th>{t.flashcard.englishMeaningColumn}</Table.Th>
                    <Table.Th>{t.flashcard.statusColumn}</Table.Th>
                    <Table.Th ta="right">{t.flashcard.audioColumn}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {cards.map((card) => (
                    <Table.Tr key={card.id}>
                      <Table.Td>
                        <Text fw={700} c="indigo">
                          {card.lemma}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="xs" c="dimmed" fs="italic">
                          {card.ipaUs}
                        </Text>
                      </Table.Td>
                      <Table.Td miw={64}>
                        <Tooltip
                          label={card.partOfSpeech}
                          events={{ hover: true, focus: true, touch: true }}
                        >
                          <Badge
                            tabIndex={0}
                            variant="outline"
                            color="gray"
                            size="sm"
                            // Mantine cắt chữ của Badge bằng dấu ba chấm; "ADJ" trong
                            // một cột hẹp thành "A..". Cột đã đủ rộng, nên để chữ hiện đủ.
                            styles={{
                              root: { overflow: "visible" },
                              label: {
                                overflow: "visible",
                                textOverflow: "clip",
                              },
                            }}
                          >
                            {abbreviatePartOfSpeech(card.partOfSpeech)}
                          </Badge>
                        </Tooltip>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm">{card.definitionVi}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="xs" c="dimmed">
                          {card.definitionEn}
                        </Text>
                      </Table.Td>
                      <Table.Td miw={140}>
                        {card.status === FlashcardReviewStatus.MASTERED && (
                          <Badge color="teal" variant="light" size="xs">
                            {t.flashcard.mastered}
                          </Badge>
                        )}
                        {card.status === FlashcardReviewStatus.REVIEW && (
                          <Badge color="indigo" variant="light" size="xs">
                            {t.flashcard.reviewStatusBadge}
                          </Badge>
                        )}
                        {card.status === FlashcardReviewStatus.LEARNING && (
                          <Badge color="blue" variant="light" size="xs">
                            {t.flashcard.learningStatusBadge}
                          </Badge>
                        )}
                        {card.status === FlashcardReviewStatus.NEW && (
                          <Badge color="gray" variant="light" size="xs">
                            {t.flashcard.newStatusBadge}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td ta="right">
                        <ActionIcon
                          variant="subtle"
                          color="indigo"
                          size="sm"
                          onClick={() => handleSpeak(card.lemma)}
                          aria-label={t.flashcard.listenWordAria.replace(
                            "{word}",
                            card.lemma,
                          )}
                        >
                          <IconVolume size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            {(data.flashcardSet.totalPages ?? 0) > 1 && (
              <Pagination
                total={data.flashcardSet.totalPages}
                value={page}
                onChange={setPage}
                disabled={loading}
              />
            )}
          </Stack>
        </Card>
      </Stack>
    </Page>
  );
}
