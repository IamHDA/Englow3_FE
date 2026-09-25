"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  ArrowRight,
  Bot,
  ClipboardCheck,
  Flame,
  Headphones,
  Layers,
  Mic,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { useAccountProfile } from "@/features/account";
import { useOnboarding } from "@/features/onboarding";
import {
  DailyQuestsCard,
  levelTitle,
  TASK_KIND_HREFS,
  TASK_KIND_LABELS,
  TASK_UNIT_LABELS,
} from "@/features/quiz";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useDailyPathQuery } from "@/lib/graphql/generated/hooks";
import { DailyTaskKind, DailyTaskStatus } from "@/lib/graphql/generated";
import { Page } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./LearnerHome.module.css";

const TASK_ICONS: Record<DailyTaskKind, LucideIcon> = {
  [DailyTaskKind.FLASHCARD_REVIEW]: Layers,
  [DailyTaskKind.DICTATION]: Headphones,
  [DailyTaskKind.QUIZ]: Sparkles,
};

type Shortcut = {
  href: string;
  icon: LucideIcon;
  vi: string;
  en: string;
  tone: string;
};

const SHORTCUTS: Shortcut[] = [
  {
    href: "/study/flashcards",
    icon: Layers,
    vi: "Thẻ từ",
    en: "Flashcards",
    tone: "navy",
  },
  {
    href: "/study/dictation",
    icon: Headphones,
    vi: "Nghe chép",
    en: "Dictation",
    tone: "teal",
  },
  {
    href: "/study/pronunciation",
    icon: Mic,
    vi: "Phát âm",
    en: "Pronunciation",
    tone: "orange",
  },
  {
    href: "/exams",
    icon: ClipboardCheck,
    vi: "Thi thử",
    en: "Mock exams",
    tone: "grape",
  },
  {
    href: "/ai-tutor",
    icon: Bot,
    vi: "Gia sư AI",
    en: "AI tutor",
    tone: "cyan",
  },
];

/**
 * Where a signed-in learner starts: who they are and how far they have come,
 * the one thing to do next, what else is on today, and a way into every kind
 * of practice. The marketing page is for people deciding whether to sign up;
 * someone who already has was being shown it again.
 */
export function LearnerHomeView() {
  const { isVi } = useLanguage();
  const { profile } = useAccountProfile();
  const { requiresOnboarding, open: openOnboarding } = useOnboarding();
  const { data, loading, error } = useDailyPathQuery({
    fetchPolicy: "cache-and-network",
  });
  const path = data?.dailyPath;

  const tasks = [...(path?.tasks ?? [])]
    .filter((task) => task.status !== DailyTaskStatus.COMPLETED)
    .sort((a, b) => a.order - b.order);
  const next = tasks[0];
  const rest = tasks.slice(1, 5);
  const name = profile?.displayName;

  return (
    <Page>
      {/* Greeting */}
      <Group justify="space-between" align="center" gap="md">
        <Stack gap={2}>
          <Title order={1} c="navy.9" className={classes.greeting}>
            {name
              ? isVi
                ? `Chào ${name}!`
                : `Hi ${name}!`
              : isVi
                ? "Chào bạn!"
                : "Welcome back!"}
          </Title>
          {path && (
            <Text size="sm" c="ink.6">
              {levelTitle(path.level, isVi)} ·{" "}
              {isVi ? `Cấp ${path.level}` : `Level ${path.level}`}
            </Text>
          )}
        </Stack>
        {path && (
          <Badge
            size="xl"
            color="orange"
            variant="light"
            leftSection={<Flame size={18} aria-hidden="true" />}
            className={classes.streak}
          >
            {isVi
              ? `${path.streakDays} ngày liên tiếp`
              : `${path.streakDays}-day streak`}
          </Badge>
        )}
      </Group>

      {requiresOnboarding && (
        <Alert
          color="orange"
          radius="lg"
          title={
            isVi ? "Hoàn tất thiết lập mục tiêu" : "Finish setting your goal"
          }
        >
          <Group justify="space-between" gap="sm">
            <Text size="sm">
              {isVi
                ? "Chọn mục tiêu và trình độ để lộ trình hằng ngày có việc cho bạn."
                : "Pick a goal and level so your daily path has work for you."}
            </Text>
            <Button color="orange.5" onClick={openOnboarding}>
              {isVi ? "Thiết lập ngay" : "Set up now"}
            </Button>
          </Group>
        </Alert>
      )}

      {error && !path && (
        <Alert color="warn" radius="lg">
          {isVi
            ? "Chưa tải được lộ trình hôm nay. Tải lại trang sau ít phút."
            : "Could not load today's path. Reload in a moment."}
        </Alert>
      )}

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            {/* Continue - the one thing to do next */}
            {loading && !path ? (
              <Skeleton height={190} radius="lg" />
            ) : (
              <Card className={classes.continueCard} withBorder={false}>
                {next ? (
                  <Stack gap="md">
                    <Group gap="xs">
                      <Badge color="orange" variant="filled">
                        {isVi ? "Học tiếp" : "Up next"}
                      </Badge>
                      <Text size="sm" c="navy.1">
                        {isVi
                          ? TASK_KIND_LABELS[next.kind].vi
                          : TASK_KIND_LABELS[next.kind].en}
                      </Text>
                    </Group>
                    <Title order={2} c="white" lineClamp={2}>
                      {next.title}
                    </Title>
                    <Text size="sm" c="navy.0">
                      {next.unitsRemaining}{" "}
                      {isVi
                        ? TASK_UNIT_LABELS[next.kind].vi
                        : next.unitsRemaining === 1
                          ? TASK_UNIT_LABELS[next.kind].en
                          : TASK_UNIT_LABELS[next.kind].enPlural}
                      {" · "}+{next.xpReward} XP
                    </Text>
                    <Button
                      component={Link}
                      href={TASK_KIND_HREFS[next.kind](next.targetId)}
                      color="orange.5"
                      size="md"
                      rightSection={<ArrowRight size={18} aria-hidden="true" />}
                      className={classes.continueButton}
                    >
                      {isVi ? "Bắt đầu" : "Start"}
                    </Button>
                  </Stack>
                ) : (
                  <Stack gap="md">
                    <Title order={2} c="white">
                      {isVi
                        ? "Hôm nay chưa có việc nào đang chờ"
                        : "Nothing waiting for you today"}
                    </Title>
                    <Text size="sm" c="navy.0">
                      {isVi
                        ? "Chọn một bộ thẻ hoặc một bài nghe để bắt đầu."
                        : "Pick a flashcard set or a listening lesson to begin."}
                    </Text>
                    <Button
                      component={Link}
                      href="/study/flashcards"
                      color="orange.5"
                      size="md"
                      rightSection={<ArrowRight size={18} aria-hidden="true" />}
                      className={classes.continueButton}
                    >
                      {isVi ? "Chọn bài học" : "Choose a lesson"}
                    </Button>
                  </Stack>
                )}
              </Card>
            )}

            {/* The rest of today */}
            {rest.length > 0 && (
              <Card>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Title order={3} c="navy.9">
                      {isVi ? "Hôm nay" : "Today"}
                    </Title>
                    <Button
                      component={Link}
                      href="/study/daily-path"
                      variant="subtle"
                      size="compact-sm"
                    >
                      {isVi ? "Xem lộ trình" : "Full path"}
                    </Button>
                  </Group>
                  {rest.map((task) => {
                    const Icon = TASK_ICONS[task.kind];
                    return (
                      <UnstyledButton
                        key={`${task.kind}-${task.targetId}`}
                        component={Link}
                        href={TASK_KIND_HREFS[task.kind](task.targetId)}
                        className={classes.taskRow}
                      >
                        <Group wrap="nowrap" gap="sm">
                          <ThemeIcon variant="light" color="navy" size={36}>
                            <Icon size={18} aria-hidden="true" />
                          </ThemeIcon>
                          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                            <Text fw={600} size="sm" truncate>
                              {task.title}
                            </Text>
                            <Text size="xs" c="ink.5">
                              {task.unitsRemaining}{" "}
                              {isVi
                                ? TASK_UNIT_LABELS[task.kind].vi
                                : TASK_UNIT_LABELS[task.kind].enPlural}
                            </Text>
                          </Stack>
                          <ArrowRight
                            size={16}
                            aria-hidden="true"
                            color="var(--mantine-color-ink-4)"
                          />
                        </Group>
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </Card>
            )}

            {/* Every kind of practice */}
            <Stack gap="sm">
              <Title order={3} c="navy.9">
                {isVi ? "Luyện tập" : "Practice"}
              </Title>
              <SimpleGrid cols={{ base: 3, sm: 5 }} spacing="sm">
                {SHORTCUTS.map(({ href, icon: Icon, vi, en, tone }) => (
                  <UnstyledButton
                    key={href}
                    component={Link}
                    href={href}
                    className={classes.shortcut}
                  >
                    <ThemeIcon
                      variant="light"
                      color={tone}
                      size={44}
                      radius="md"
                    >
                      <Icon size={22} aria-hidden="true" />
                    </ThemeIcon>
                    <Text fw={600} size="sm" mt={8}>
                      {isVi ? vi : en}
                    </Text>
                  </UnstyledButton>
                ))}
              </SimpleGrid>
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {path ? (
              <Card>
                <Stack gap={8}>
                  <Group justify="space-between">
                    <Text fw={700}>
                      {isVi ? `Cấp ${path.level}` : `Level ${path.level}`}
                    </Text>
                    <Text size="sm" c="ink.6">
                      {path.totalXp} XP
                    </Text>
                  </Group>
                  <Progress
                    value={
                      path.levelCostXp > 0
                        ? (path.xpIntoLevel / path.levelCostXp) * 100
                        : 0
                    }
                    color="orange"
                    size="lg"
                    radius="xl"
                  />
                  <Text size="xs" c="ink.5">
                    {isVi
                      ? `Còn ${path.levelCostXp - path.xpIntoLevel} XP để lên cấp ${path.level + 1}`
                      : `${path.levelCostXp - path.xpIntoLevel} XP to level ${path.level + 1}`}
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Skeleton height={110} radius="lg" />
            )}
            {path ? (
              <DailyQuestsCard quests={path.quests} />
            ) : (
              <Skeleton height={260} radius="lg" />
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Page>
  );
}
