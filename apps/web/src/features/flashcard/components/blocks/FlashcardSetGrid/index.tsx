"use client";

import { SimpleGrid } from "@mantine/core";
import { IconBook, IconClock } from "@tabler/icons-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FlashcardSet } from "../../../types";
import { LibraryCard } from "@/shared/components/LibraryCard";

interface FlashcardSetGridProps {
  sets: FlashcardSet[];
}

/**
 * Derived, not stored: the backend reports how many cards are mastered, and the
 * bar wants a proportion. Computing it here keeps one number in the API instead
 * of two that can disagree.
 */
/**
 * The backend reports an instant; the card wants "3 days ago". Null means the
 * learner has never opened this set, which is not the same as "0 days ago".
 */
function formatLastStudied(value: string | null, isVi: boolean): string {
  if (!value) return isVi ? "Chưa học" : "Not started";

  const days = Math.floor((Date.now() - Date.parse(value)) / 86_400_000);
  if (days <= 0) return isVi ? "Hôm nay" : "Today";
  if (days === 1) return isVi ? "Hôm qua" : "Yesterday";
  return isVi ? `${days} ngày trước` : `${days} days ago`;
}

function masteredPercent(set: FlashcardSet): number {
  if (set.cardCount === 0) return 0;
  return Math.round((set.masteredCount / set.cardCount) * 100);
}

export function FlashcardSetGrid({ sets }: FlashcardSetGridProps) {
  const { isVi } = useLanguage();

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
                    label: isVi
                      ? `${set.dueCount} thẻ cần ôn`
                      : `${set.dueCount} due`,
                    color: "orange",
                  }
                : undefined
            }
            title={set.name}
            meta={[
              {
                icon: <IconBook size={15} />,
                label: isVi
                  ? `${set.cardCount} từ vựng`
                  : `${set.cardCount} words`,
              },
              {
                icon: <IconClock size={15} />,
                label: formatLastStudied(set.lastStudiedAt, isVi),
              },
            ]}
            progress={{
              value: mastered,
              label: isVi ? "Đã thuộc" : "Mastered",
            }}
            secondaryAction={{
              label: isVi ? "Chi tiết" : "Details",
              href: `/study/flashcards/${set.slug}`,
            }}
            action={{
              label:
                set.dueCount > 0
                  ? isVi
                    ? "Ôn ngay"
                    : "Review"
                  : isVi
                    ? "Học"
                    : "Study",
              href: `/study/flashcards/${set.slug}/study`,
              emphasis: set.dueCount > 0 ? "continue" : "default",
            }}
          />
        );
      })}
    </SimpleGrid>
  );
}
