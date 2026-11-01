"use client";

import {
  Alert,
  Badge,
  Card,
  Group,
  List,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  Title,
  type MantineColor,
} from "@mantine/core";
import { CheckCircle2, Lightbulb } from "lucide-react";

import type {
  TranslationAttemptFieldsFragment,
  TranslationMistakeType,
  TranslationVerdict,
} from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

type Words = { vi: string; en: string };

const VERDICTS: Record<
  TranslationVerdict,
  { label: Words; color: MantineColor }
> = {
  EXCELLENT: { label: { vi: "Xuất sắc", en: "Excellent" }, color: "teal" },
  GOOD: { label: { vi: "Tốt", en: "Good" }, color: "blue" },
  PARTIAL: {
    label: { vi: "Đúng một phần", en: "Partly right" },
    color: "yellow",
  },
  NEEDS_WORK: { label: { vi: "Cần cố gắng", en: "Needs work" }, color: "red" },
};

const MISTAKE_TYPES: Record<TranslationMistakeType, Words> = {
  MEANING: { vi: "Ý nghĩa", en: "Meaning" },
  GRAMMAR: { vi: "Ngữ pháp", en: "Grammar" },
  VOCABULARY: { vi: "Từ vựng", en: "Vocabulary" },
  SPELLING: { vi: "Chính tả", en: "Spelling" },
  WORD_ORDER: { vi: "Trật tự từ", en: "Word order" },
  OTHER: { vi: "Khác", en: "Other" },
};

/** The four parts and their ceilings, as the grader scores them. */
const PARTS: {
  key: "meaning" | "grammar" | "vocabulary" | "naturalness";
  max: number;
  label: Words;
}[] = [
  { key: "meaning", max: 40, label: { vi: "Ý nghĩa", en: "Meaning" } },
  { key: "grammar", max: 30, label: { vi: "Ngữ pháp", en: "Grammar" } },
  { key: "vocabulary", max: 20, label: { vi: "Từ vựng", en: "Vocabulary" } },
  {
    key: "naturalness",
    max: 10,
    label: { vi: "Độ tự nhiên", en: "Naturalness" },
  },
];

export function TranslationResultCard({
  attempt,
}: {
  attempt: TranslationAttemptFieldsFragment;
}) {
  const { isVi } = useLanguage();
  const pick = (words: Words) => (isVi ? words.vi : words.en);
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const feedback = attempt.feedback;

  if (attempt.status === "FAILED" || !feedback) {
    return (
      <Alert
        color="warn"
        title={t("Chưa chấm được câu này", "This one could not be graded")}
      >
        {t(
          "Hệ thống chấm đang gặp sự cố. Bạn có thể nộp lại sau ít phút.",
          "The grader had a problem. You can submit again in a few minutes.",
        )}
      </Alert>
    );
  }

  const verdict = VERDICTS[feedback.verdict];
  const score = attempt.score ?? 0;

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <RingProgress
              size={84}
              thickness={8}
              roundCaps
              sections={[{ value: score, color: verdict.color }]}
              label={
                <Text ta="center" fw={700} size="lg">
                  {score}
                </Text>
              }
              aria-label={t(
                `Điểm ${score} trên 100`,
                `Score ${score} out of 100`,
              )}
            />
            <Stack gap={4}>
              <Badge color={verdict.color} variant="light" size="lg">
                {pick(verdict.label)}
              </Badge>
              <Text size="sm">{feedback.summary}</Text>
            </Stack>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {PARTS.map((part) => (
            <Stack key={part.key} gap={4}>
              <Group justify="space-between" gap={4}>
                <Text size="xs" c="dimmed">
                  {pick(part.label)}
                </Text>
                <Text size="xs" fw={600}>
                  {feedback.parts[part.key]}/{part.max}
                </Text>
              </Group>
              <Progress
                value={(feedback.parts[part.key] / part.max) * 100}
                color={verdict.color}
                size="sm"
                aria-label={pick(part.label)}
              />
            </Stack>
          ))}
        </SimpleGrid>

        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {t("Câu của bạn", "Your translation")}
          </Text>
          <Text>{attempt.response}</Text>
        </Stack>

        {feedback.errors.length > 0 && (
          <Stack gap="xs">
            <Title order={4}>{t("Lỗi cần sửa", "What to fix")}</Title>
            <List spacing="sm" listStyleType="none" p={0}>
              {feedback.errors.map((error, index) => (
                <List.Item key={index}>
                  <Stack gap={2}>
                    <Group gap="xs" wrap="wrap">
                      <Badge size="sm" variant="outline" color="gray">
                        {pick(MISTAKE_TYPES[error.type])}
                      </Badge>
                      <Text td="line-through" c="red.7">
                        {error.original}
                      </Text>
                      <Text aria-hidden>→</Text>
                      <Text fw={600} c="teal.8">
                        {error.correction}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {error.explanation}
                    </Text>
                  </Stack>
                </List.Item>
              ))}
            </List>
          </Stack>
        )}

        <Card bg="var(--mantine-color-teal-light)" padding="sm" radius="sm">
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <CheckCircle2
              size={18}
              aria-hidden
              style={{ flexShrink: 0, marginTop: 3 }}
            />
            <Stack gap={2}>
              <Text size="xs" fw={600}>
                {t("Câu đã sửa", "Corrected")}
              </Text>
              <Text>{feedback.improved}</Text>
            </Stack>
          </Group>
        </Card>

        {attempt.referenceEn && (
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t("Bản dịch mẫu", "Model translation")}
            </Text>
            <Text>{attempt.referenceEn}</Text>
          </Stack>
        )}

        {attempt.notes && (
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <Lightbulb
              size={16}
              aria-hidden
              style={{ flexShrink: 0, marginTop: 3 }}
            />
            <Text size="sm" c="dimmed">
              {attempt.notes}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
