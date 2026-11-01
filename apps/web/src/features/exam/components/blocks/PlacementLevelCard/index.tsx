"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Compass, Home, Sparkles } from "lucide-react";
import Link from "next/link";

import { useAccountProfile } from "@/features/account";
import { CefrLevel } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

type Words = { vi: string; en: string };

/**
 * Percentage floors, highest first - the same bands the backend's
 * PlacementRecorderImpl records. Used only when the profile does not yet carry
 * this attempt's level (an older attempt, or a profile not reloaded yet).
 */
const BANDS: [number, CefrLevel][] = [
  [90, CefrLevel.C2],
  [75, CefrLevel.C1],
  [60, CefrLevel.B2],
  [45, CefrLevel.B1],
  [25, CefrLevel.A2],
];

export function levelForScore(percentage: number): CefrLevel {
  return BANDS.find(([floor]) => percentage >= floor)?.[1] ?? CefrLevel.A1;
}

const LEVELS: Record<CefrLevel, { name: Words; summary: Words }> = {
  [CefrLevel.A1]: {
    name: { vi: "Sơ cấp", en: "Beginner" },
    summary: {
      vi: "Bạn hiểu và dùng được những câu rất đơn giản: chào hỏi, giới thiệu bản thân, hỏi đáp thông tin cơ bản.",
      en: "You can understand and use very simple sentences: greetings, introducing yourself, basic questions.",
    },
  },
  [CefrLevel.A2]: {
    name: { vi: "Sơ trung cấp", en: "Elementary" },
    summary: {
      vi: "Bạn giao tiếp được trong các tình huống quen thuộc hằng ngày như mua sắm, công việc, gia đình.",
      en: "You can handle familiar everyday situations such as shopping, work and family.",
    },
  },
  [CefrLevel.B1]: {
    name: { vi: "Trung cấp", en: "Intermediate" },
    summary: {
      vi: "Bạn nắm ý chính của văn bản rõ ràng, xoay xở được khi đi lại và kể về trải nghiệm, kế hoạch của mình.",
      en: "You get the main points of clear texts, cope when travelling and describe experiences and plans.",
    },
  },
  [CefrLevel.B2]: {
    name: { vi: "Trung cao cấp", en: "Upper intermediate" },
    summary: {
      vi: "Bạn hiểu ý chính của văn bản phức tạp và trao đổi khá trôi chảy về nhiều chủ đề.",
      en: "You understand the main ideas of complex texts and discuss many topics fairly fluently.",
    },
  },
  [CefrLevel.C1]: {
    name: { vi: "Cao cấp", en: "Advanced" },
    summary: {
      vi: "Bạn dùng tiếng Anh linh hoạt và hiệu quả cho học tập, công việc, hiểu được cả ý ngầm trong văn bản.",
      en: "You use English flexibly for study and work, and catch implied meaning in texts.",
    },
  },
  [CefrLevel.C2]: {
    name: { vi: "Thành thạo", en: "Proficient" },
    summary: {
      vi: "Bạn hiểu gần như mọi thứ đọc được và diễn đạt chính xác, tinh tế.",
      en: "You understand virtually everything you read and express yourself precisely.",
    },
  },
};

/** Where to practise a weak part, by the words its title carries. */
function practiceFor(partTitle: string): { href: string; label: Words } {
  const title = partTitle.toLowerCase();
  if (title.includes("vocab"))
    return {
      href: "/study/flashcards",
      label: {
        vi: "Học từ vựng với Flashcards",
        en: "Build vocabulary with flashcards",
      },
    };
  if (title.includes("grammar"))
    return {
      href: "/study/quiz",
      label: {
        vi: "Luyện ngữ pháp với Quiz",
        en: "Practise grammar with quizzes",
      },
    };
  return {
    href: "/exams",
    label: {
      vi: "Luyện đọc với đề thi thử",
      en: "Practise reading with mock exams",
    },
  };
}

export type PartScore = { title: string; correct: number; total: number };

export function PlacementLevelCard({
  attemptId,
  scorePercentage,
  parts,
}: {
  attemptId: string;
  scorePercentage: number;
  parts: PartScore[];
}) {
  const { isVi } = useLanguage();
  const pick = (words: Words) => (isVi ? words.vi : words.en);
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const { profile } = useAccountProfile();

  // The level the backend recorded for this very attempt is the one that counts.
  const recorded =
    profile?.onboardingState?.placementAttemptId === attemptId
      ? profile.onboardingState.currentLevel
      : null;
  const level = recorded ?? levelForScore(scorePercentage);
  const info = LEVELS[level];

  const scored = parts.filter((part) => part.total > 0);
  const weakest = [...scored].sort(
    (a, b) => a.correct / a.total - b.correct / b.total,
  )[0];
  const practice = weakest ? practiceFor(weakest.title) : null;

  return (
    <Card withBorder radius="lg" p={{ base: "lg", md: "xl" }}>
      <Stack gap="lg">
        <Group gap="lg" wrap="nowrap" align="center">
          <Badge
            size="xl"
            radius="md"
            color="teal"
            variant="filled"
            h={72}
            w={72}
            styles={{ label: { fontSize: 28 } }}
            aria-hidden
          >
            {level}
          </Badge>
          <Stack gap={4}>
            <Text size="sm" c="ink.6" fw={600} tt="uppercase">
              {t("Trình độ hiện tại của bạn", "Your current level")}
            </Text>
            <Title order={2} size="h3" c="navy.9">
              {level} · {pick(info.name)}
            </Title>
            <Text size="sm">{pick(info.summary)}</Text>
          </Stack>
        </Group>

        {scored.length > 0 && (
          <Stack gap="sm">
            <Text fw={700}>{t("Kết quả từng phần", "By part")}</Text>
            {scored.map((part) => {
              const percent = Math.round((part.correct / part.total) * 100);
              return (
                <Stack key={part.title} gap={4}>
                  <Group justify="space-between">
                    <Text size="sm">{part.title}</Text>
                    <Text size="sm" fw={600}>
                      {part.correct}/{part.total}
                    </Text>
                  </Group>
                  <Progress
                    value={percent}
                    color={
                      percent >= 75 ? "teal" : percent >= 50 ? "yellow" : "red"
                    }
                    aria-label={part.title}
                  />
                </Stack>
              );
            })}
          </Stack>
        )}

        {weakest && practice && weakest.correct < weakest.total && (
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <Sparkles
              size={18}
              aria-hidden
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <Text size="sm">
              {t(
                `Phần cần ưu tiên: ${weakest.title}. `,
                `Focus first on: ${weakest.title}. `,
              )}
              <Text
                component={Link}
                href={practice.href}
                c="teal.8"
                fw={600}
                inherit
              >
                {pick(practice.label)}
              </Text>
            </Text>
          </Group>
        )}

        <Text size="xs" c="ink.6">
          {t(
            "Bài kiểm tra này đo ngữ pháp, từ vựng và đọc hiểu; trình độ đã được lưu vào hồ sơ và dùng để gợi ý lộ trình. Bạn có thể làm lại bất cứ lúc nào.",
            "This test measures grammar, vocabulary and reading; the level is saved to your profile and used to suggest your path. You can retake it at any time.",
          )}
        </Text>

        <Group gap="sm">
          <Button
            component={Link}
            href="/study/daily-path"
            color="orange"
            leftSection={<Compass size={16} aria-hidden />}
          >
            {t("Bắt đầu lộ trình", "Start your path")}
          </Button>
          <Button
            component={Link}
            href="/"
            variant="default"
            leftSection={<Home size={16} aria-hidden />}
          >
            {t("Về trang chủ", "Back to home")}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
