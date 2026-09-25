"use client";

import { Box, Button, Group, Progress, Stack, Text } from "@mantine/core";
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
  const { isVi } = useLanguage();

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
  } = useFlashcardStudy({
    cards,
    setName: set?.name ?? "",
    /**
     * Gửi đi rồi đi tiếp, không chờ. Lịch ôn là việc của server và nó đã nhận
     * câu trả lời; bắt người học đứng chờ một round trip giữa hai thẻ là đánh
     * đổi sai. Lỗi mạng làm mất một lượt ghi, không làm hỏng phiên học.
     */
    onRate: (cardId, rating, timeSpentSeconds) => {
      void rateFlashcard({
        variables: { flashcardId: cardId, rating, timeSpentSeconds },
      }).catch(() => undefined);
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
            label: isVi ? "Về thư viện bộ thẻ" : "Back to decks",
          }}
          onRetry={() => void refetchQueue()}
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
            {isVi ? "Chưa có thẻ nào cần ôn" : "Nothing to review yet"}
          </Text>
          <Text size="sm" c="ink.6" ta="center" maw={420}>
            {isVi
              ? "Bạn đã ôn hết các thẻ đến hạn của bộ này. Quay lại sau khi có thẻ tới lượt ôn."
              : "You have reviewed every card that is due in this deck. Come back when more are due."}
          </Text>
          <Button
            component={Link}
            href={`/study/flashcards/${setId}`}
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
          >
            {isVi ? "Về bộ thẻ" : "Back to the deck"}
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
            {isVi ? "Thoát phiên học" : "Exit session"}
          </Button>

          <Stack gap={2} align="center">
            <Text fw={700} fz="sm" c="dark.9">
              {set?.name ?? ""}
            </Text>
            <Text fz="xs" c="dimmed">
              {isVi
                ? `Thẻ số ${currentIndex + 1} trên ${totalCards}`
                : `Card ${currentIndex + 1} of ${totalCards}`}
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
        <FlashcardStudyControls
          isFlipped={isFlipped}
          onFlip={flipCard}
          onRate={rateCard}
        />
      </Stack>
    </Page>
  );
}
