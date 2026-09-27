"use client";

import { SimpleGrid } from "@mantine/core";
import { IconBook, IconClock } from "@tabler/icons-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FlashcardSet } from "../../../types";
import { LibraryCard } from "@/shared/components/LibraryCard";
import { formatLastStudied, masteredPercent } from "../../../setProgress";

interface FlashcardSetGridProps {
  sets: FlashcardSet[];
}

export function FlashcardSetGrid({ sets }: FlashcardSetGridProps) {
  const { t } = useLanguage();

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {sets.map((set) => {
        const mastered = masteredPercent(set);
        return (
          <LibraryCard
            key={set.id}
            eyebrow={set.topic}
            level={set.targetLevel}
            status={
              set.dueCount > 0
                ? {
                    label: t.flashcard.dueCardsBadge.replace(
                      "{count}",
                      String(set.dueCount),
                    ),
                    color: "orange",
                  }
                : undefined
            }
            title={set.name}
            meta={[
              {
                icon: <IconBook size={15} />,
                label: `${set.cardCount} ${t.flashcard.wordsCountSuffix}`,
              },
              {
                icon: <IconClock size={15} />,
                label: formatLastStudied(set.lastStudiedAt, t),
              },
            ]}
            progress={{
              value: mastered,
              label: t.flashcard.mastered,
            }}
            secondaryAction={{
              label: t.dictation.detailsButton,
              href: `/study/flashcards/${set.id}`,
            }}
            action={{
              label:
                set.dueCount > 0
                  ? t.flashcard.reviewButton
                  : t.flashcard.studyButton,
              href: `/study/flashcards/${set.id}/study`,
              emphasis: set.dueCount > 0 ? "continue" : "default",
            }}
          />
        );
      })}
    </SimpleGrid>
  );
}
