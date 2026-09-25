"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { IconMicrophone } from "@tabler/icons-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { SpeakingPrompt } from "../../../types";
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

      <Grid gap="md">
        {filteredPrompts.map((prompt) => (
          <Grid.Col key={prompt.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card
              withBorder
              padding="lg"
              radius="md"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.15s ease",
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Badge variant="light" color="indigo" size="xs">
                    {prompt.category}
                  </Badge>
                  {prompt.targetLevel !== null && (
                    <Badge variant="dot" color="teal" size="xs">
                      {prompt.targetLevel}
                    </Badge>
                  )}
                </Group>

                <Text fw={700} fz="md" c="dark.9" lineClamp={2}>
                  {prompt.title}
                </Text>

                {prompt.phonemeTarget !== null && (
                  <Box
                    p="xs"
                    style={{
                      backgroundColor: "var(--mantine-color-indigo-0)",
                      borderRadius: "var(--mantine-radius-sm)",
                    }}
                  >
                    <Text fz="xs" c="indigo.8" fw={700}>
                      {isVi ? "Trọng tâm:" : "Focus:"} {prompt.phonemeTarget}
                    </Text>
                  </Box>
                )}

                <Text fz="xs" c="dark.8" fs="italic" lineClamp={2}>
                  &ldquo;{prompt.referenceText}&rdquo;
                </Text>

                <Text fz="xs" c="dimmed" lineClamp={2}>
                  {prompt.translationVi}
                </Text>

                {/* Null cho tới khi người học chấm xong lần đầu - không phải 0. */}
                {prompt.bestScorePercent !== null && (
                  <Group gap="xs" mt="xs">
                    <Badge variant="light" color="teal" size="xs">
                      {isVi ? "Điểm cao nhất:" : "Best Score:"}{" "}
                      {Math.round(prompt.bestScorePercent)}/100
                    </Badge>
                  </Group>
                )}
              </Stack>

              <Group mt="md">
                <Button
                  component={Link}
                  href={`/study/pronunciation/${prompt.id}`}
                  variant="filled"
                  color="indigo"
                  fullWidth
                  size="xs"
                  leftSection={<IconMicrophone size={16} />}
                >
                  {isVi ? "Bắt đầu luyện phát âm" : "Start Practice"}
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
