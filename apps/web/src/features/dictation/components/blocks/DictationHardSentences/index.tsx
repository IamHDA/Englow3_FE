"use client";

import {
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { DifficultSentenceItem } from "../../../types";

interface DictationHardSentencesProps {
  sentences: DifficultSentenceItem[];
}

export function DictationHardSentences({ sentences }: DictationHardSentencesProps) {
  const { isVi, t } = useLanguage();

  return (
    <Paper radius="md" p="lg" withBorder bg="white">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <HelpCircle size={18} color="var(--mantine-color-orange-8)" />
            <Title order={3} size="h5" fw={700} c="ink.9">
              {t.dictation.difficultSentencesTitle}
            </Title>
          </Group>
          <Text size="xs" c="ink.5">
            {isVi ? "Dựa trên tỉ lệ gõ đúng trung bình thấp nhất" : "Ranked by lowest average accuracy"}
          </Text>
        </Group>

        <Stack gap="xs">
          {sentences.map((s) => (
            <Card key={s.id} radius="md" p="md" withBorder bg="ink.0">
              <Flex
                direction={{ base: "column", sm: "row" }}
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                gap="sm"
              >
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Badge size="xs" variant="light" color="navy">
                      {s.topic}
                    </Badge>
                    <Badge size="xs" color="warn" variant="light">
                      {isVi ? `Chính xác TB: ${s.avgAccuracyPercent}%` : `Avg. Accuracy: ${s.avgAccuracyPercent}%`}
                    </Badge>
                    <Text size="xs" c="ink.5">
                      • {s.attemptsCount} {isVi ? "lần thử" : "attempts"}
                    </Text>
                  </Group>

                  <Text size="sm" fw={600} c="ink.9" style={{ fontStyle: "italic" }}>
                    “{s.text}”
                  </Text>
                </Stack>

                <Button
                  component={Link}
                  href="/study/dictation/ordering-food-at-a-restaurant"
                  size="xs"
                  variant="outline"
                  color="navy"
                  radius="md"
                  rightSection={<ArrowRight size={13} />}
                  fw={600}
                >
                  {isVi ? "Luyện tập" : "Practice"}
                </Button>
              </Flex>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
