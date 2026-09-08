"use client";

import {
  Badge,
  Button,
  Flex,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ArrowRight, Clock, Flame } from "lucide-react";
import Link from "next/link";
import { CONTINUE_HERO_LESSON } from "../../../constants/dictationData";

export function DictationHeroCard() {
  const lesson = CONTINUE_HERO_LESSON;

  return (
    <Paper
      radius="lg"
      p={{ base: "md", sm: "xl" }}
      withBorder
      style={{
        background: "linear-gradient(135deg, #1B2540 0%, #1E3A8A 100%)",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        gap="lg"
      >
        <Stack gap="xs" style={{ maxWidth: 620 }}>
          <Group gap="xs">
            <Badge
              color="orange"
              variant="filled"
              size="sm"
              radius="sm"
              leftSection={<Flame size={12} />}
            >
              Tiếp tục học gần đây
            </Badge>
            <Badge
              variant="outline"
              color="gray"
              size="sm"
              radius="sm"
              style={{ color: "#E9EEFB", borderColor: "rgba(255,255,255,0.25)" }}
            >
              {lesson.level}
            </Badge>
          </Group>

          <Title order={2} size="h3" fw={700} style={{ color: "#FFFFFF" }}>
            {lesson.title}
          </Title>

          <Group gap="md" align="center">
            <Group gap={6}>
              <ThemeIcon size={20} radius="xl" color="orange" variant="light">
                <Clock size={12} />
              </ThemeIcon>
              <Text size="xs" style={{ color: "#C5CBD7" }}>
                Luyện tập gần nhất: {lesson.lastPracticed}
              </Text>
            </Group>
            <Text size="xs" style={{ color: "#C5CBD7" }}>
              • {lesson.progressText}
            </Text>
          </Group>

          <Stack gap={4} mt={4}>
            <Progress
              value={lesson.progressPercent}
              color="orange"
              size="sm"
              radius="xl"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
          </Stack>
        </Stack>

        <Button
          component={Link}
          href={`/study/dictation/${lesson.lessonId}`}
          color="orange"
          size="md"
          radius="md"
          fw={600}
          rightSection={<ArrowRight size={16} />}
          style={{ minWidth: 160 }}
        >
          Tiếp tục học
        </Button>
      </Flex>
    </Paper>
  );
}
