"use client";

import {
  Box,
  Button,
  Container,
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

interface FlashcardStudyViewProps {
  setId: string;
}

export function FlashcardStudyView({ setId }: FlashcardStudyViewProps) {
  const { isVi } = useLanguage();

  // Hàng chờ do backend xếp: thẻ tới hạn trước, thẻ chưa gặp sau. Chỉ lấy một
  // lần cho cả phiên - lấy lại giữa chừng sẽ xáo thứ tự dưới chân người học.
  const { data: queueData, loading: queueLoading } =
    useFlashcardStudyQueueQuery({
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

  if (isCompleted) {
    return (
      <Container size="md" py="xl">
        <FlashcardSessionSummary
          summary={summaryData}
          onRestart={restartStudy}
        />
      </Container>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Top Navigation & Status Bar */}
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href={`/study/flashcards/${set?.slug ?? setId}`}
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
    </Container>
  );
}
