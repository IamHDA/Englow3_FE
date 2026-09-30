"use client";

import {
  Alert,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useFlashcardStudy } from "../../../hooks/useFlashcardStudy";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useFlashcardSetDetailQuery,
  useFlashcardStudyQueueQuery,
  useRateFlashcardMutation,
} from "@/lib/graphql/generated/hooks";
import { FlashcardStudySkeleton } from "../../blocks/FlashcardStudySkeleton";
import { Flashcard3DCard } from "../../blocks/Flashcard3DCard";
import { FlashcardSessionSummary } from "../../blocks/FlashcardSessionSummary";
import { FlashcardStudyControls } from "../../blocks/FlashcardStudyControls";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";

interface FlashcardStudyViewProps {
  setId: string;
}

export function FlashcardStudyView({ setId }: FlashcardStudyViewProps) {
  const { isVi, t } = useLanguage();

  // Hàng chờ do backend xếp: thẻ tới hạn trước, thẻ chưa gặp sau. Chỉ lấy một
  // lần cho cả phiên - lấy lại giữa chừng sẽ xáo thứ tự dưới chân người học.
  const {
    data: queueData,
    loading: queueLoading,
    error: queueError,
    refetch: refetchQueue,
  } = useFlashcardStudyQueueQuery({
    variables: { setId },
    fetchPolicy: "network-only",
  });
  const { data: setData } = useFlashcardSetDetailQuery({
    variables: { id: setId },
  });
  const [rateFlashcard] = useRateFlashcardMutation();

  const cards = queueData?.flashcardStudyQueue ?? [];
  const set = setData?.flashcardSet.set;

  const {
    currentIndex,
    totalCards,
    currentCard,
    isFlipped,
    progressPercent,
    studyDurationFormatted,
    isCompleted,
    summaryData,
    flipCard,
    speakCard,
    rateCard,
    restartStudy,
    saving,
    saveError,
  } = useFlashcardStudy({
    cards,
    setName: set?.name ?? "",
    onRate: async (cardId, rating, timeSpentSeconds) => {
      const response = await rateFlashcard({
        variables: { flashcardId: cardId, rating, timeSpentSeconds },
      });
      if (!response.data) throw new Error("Rating was not saved");
    },
  });

  if (queueLoading && cards.length === 0) {
    return <FlashcardStudySkeleton />;
  }

  if (queueError && cards.length === 0) {
    return (
      <Page width="focus">
        <LoadErrorState
          error={queueError}
          thing={{ vi: "bộ thẻ", en: "deck" }}
          back={{
            href: "/study/flashcards",
            label: t.flashcard.backToDecksButton,
          }}
          onRetry={() => void refetchQueue().catch(() => undefined)}
        />
      </Page>
    );
  }

  if (isCompleted) {
    return (
      <Page width="focus">
        <FlashcardSessionSummary
          summary={summaryData}
          onRestart={restartStudy}
        />
      </Page>
    );
  }

  // Nothing due and nothing new: say so, rather than the blank page this
  // used to be.
  if (!currentCard) {
    return (
      <Page width="focus">
        <Stack align="center" gap="md" py={60}>
          <Text size="lg" fw={700} c="navy.9" ta="center">
            {t.flashcard.nothingToReviewTitle}
          </Text>
          <Text size="sm" c="ink.6" ta="center" maw={420}>
            {t.flashcard.nothingToReviewDescription}
          </Text>
          <Button
            component={Link}
            href={`/study/flashcards/${setId}`}
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
          >
            {t.flashcard.backToDeckButton}
          </Button>
        </Stack>
      </Page>
    );
  }

  return (
    <Page width="focus">
      <Stack gap="xl">
        {/* Top Navigation & Status Bar */}
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href={`/study/flashcards/${setId}`}
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
          >
            {t.flashcard.exitSessionButton}
          </Button>

          <Stack gap={2} align="center">
            <Text fw={700} fz="sm" c="dark.9">
              {set?.name ?? ""}
            </Text>
            <Text fz="xs" c="dimmed">
              {t.flashcard.cardPositionLabel
                .replace("{current}", String(currentIndex + 1))
                .replace("{total}", String(totalCards))}
            </Text>
          </Stack>

          <Group gap="xs">
            <IconClock size={16} color="var(--mantine-color-dimmed)" />
            <Text fz="xs" fw={600} c="dimmed">
              {studyDurationFormatted}
            </Text>
          </Group>
        </Group>

        {/* Progress Bar */}
        <Box>
          <Progress
            value={progressPercent}
            color="indigo"
            size="sm"
            radius="xl"
            animated
          />
        </Box>

        {/* 3D Flashcard */}
        <Flashcard3DCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={flipCard}
          onSpeak={speakCard}
        />

        {/* Study SRS Controls */}
        {saveError && (
          <Alert color="red" role="alert">
            {isVi
              ? "Chưa lưu được đánh giá. Thẻ vẫn được giữ lại; kiểm tra kết nối rồi chọn đánh giá để thử lại."
              : "Your rating could not be saved. This card is still here; check your connection and rate it again."}
          </Alert>
        )}
        {saving && (
          <Text role="status" ta="center">
            {isVi ? "Đang lưu đánh giá…" : "Saving rating…"}
          </Text>
        )}
        <FlashcardStudyControls
          disabled={saving}
          isFlipped={isFlipped}
          onFlip={flipCard}
          onRate={rateCard}
        />
      </Stack>
    </Page>
  );
}
