"use client";

import { Card, SegmentedControl, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconMicrophone } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import type { SpeakingPrompt } from "../../../types";
import { LibraryCard } from "@/shared/components/LibraryCard";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface PronunciationLessonGridProps {
  prompts: SpeakingPrompt[];
}

export function PronunciationLessonGrid({
  prompts,
}: PronunciationLessonGridProps) {
  const { isVi } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = useMemo(() => {
    const set = new Set(prompts.map((prompt) => prompt.category));
    return ["ALL", ...Array.from(set)];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "ALL") return prompts;
    return prompts.filter((prompt) => prompt.category === selectedCategory);
  }, [prompts, selectedCategory]);

  return (
    <Stack gap="md">
      {/* A filter with one option is no filter: offer it only when there
          are categories to choose between. The page title already says what
          this list is. */}
      {categories.length > 2 && (
        <SegmentedControl
          size="xs"
          value={selectedCategory}
          onChange={setSelectedCategory}
          data={categories.map((c) => ({
            value: c,
            label: c === "ALL" ? (isVi ? "Tất cả bài học" : "All Lessons") : c,
          }))}
        />
      )}

      {/* Không có câu nào thì nói thế - trước đây chỉ còn tiêu đề trơ trọi. */}
      {filteredPrompts.length === 0 && (
        <Card withBorder radius="md" p="xl">
          <Text ta="center" c="dimmed" fz="sm">
            {isVi
              ? "Chưa có câu luyện phát âm nào được phát hành. Trong lúc chờ, bạn có thể nghe mẫu từng âm ở bảng IPA bên dưới."
              : "No pronunciation prompts have been published yet. Meanwhile, you can hear each sound in the IPA chart below."}
          </Text>
        </Card>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {filteredPrompts.map((prompt) => (
          <LibraryCard
            key={prompt.id}
            eyebrow={prompt.category}
            level={prompt.targetLevel}
            title={prompt.title}
            meta={
              prompt.phonemeTarget !== null
                ? [
                    {
                      icon: <IconMicrophone size={15} />,
                      label: `${isVi ? "Âm" : "Sound"} ${prompt.phonemeTarget}`,
                    },
                  ]
                : []
            }
            // Null until the first attempt is scored - not 0.
            progress={
              prompt.bestScorePercent !== null
                ? {
                    value: prompt.bestScorePercent,
                    label: isVi ? "Điểm cao nhất" : "Best score",
                  }
                : undefined
            }
            action={{
              label: isVi ? "Luyện ngay" : "Practise",
              href: `/study/pronunciation/${prompt.id}`,
            }}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
