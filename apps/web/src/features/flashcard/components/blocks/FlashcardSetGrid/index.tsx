"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBook,
  IconClock,
  IconEye,
  IconPlayerPlay,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { FlashcardSet } from "../../../types";

interface FlashcardSetGridProps {
  sets: FlashcardSet[];
}

export function FlashcardSetGrid({ sets }: FlashcardSetGridProps) {
  return (
    <Grid gap="md">
      {sets.map((set) => (
        <Grid.Col key={set.id} span={{ base: 12, sm: 6, lg: 4 }}>
          <Card
            withBorder
            padding="lg"
            radius="md"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <Badge variant="light" color="indigo" size="sm">
                  {set.topic}
                </Badge>
                {set.dueTodayCount > 0 ? (
                  <Badge variant="filled" color="orange" size="xs">
                    {set.dueTodayCount} thẻ cần ôn
                  </Badge>
                ) : (
                  <Badge variant="light" color="teal" size="xs">
                    Đã hoàn thành
                  </Badge>
                )}
              </Group>

              <Text fw={700} fz="md" c="dark.9" lineClamp={2}>
                {set.name}
              </Text>

              <Text fz="xs" c="dimmed" lineClamp={2}>
                {set.description}
              </Text>

              <Box mt="xs">
                <Group justify="space-between" mb={4}>
                  <Text fz="xs" c="dimmed">
                    Đã thuần thục:
                  </Text>
                  <Text fz="xs" fw={700} c="indigo">
                    {set.masteredPercent}%
                  </Text>
                </Group>
                <Progress
                  value={set.masteredPercent}
                  color="indigo"
                  size="sm"
                  radius="xl"
                />
              </Box>

              <Group justify="space-between" mt="xs" c="dimmed" fz="xs">
                <Group gap={4}>
                  <IconBook size={14} />
                  <span>{set.totalCards} từ vựng</span>
                </Group>
                <Group gap={4}>
                  <IconClock size={14} />
                  <span>{set.lastStudied}</span>
                </Group>
              </Group>
            </Stack>

            <Group mt="md" justify="space-between">
              <Button
                component={Link}
                href={`/study/flashcards/${set.slug}`}
                variant="light"
                color="gray"
                size="xs"
                leftSection={<IconEye size={14} />}
              >
                Chi tiết
              </Button>
              <Button
                component={Link}
                href={`/study/flashcards/${set.slug}/study`}
                variant="filled"
                color="indigo"
                size="xs"
                leftSection={<IconPlayerPlay size={14} />}
              >
                Học ngay
              </Button>
            </Group>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}
