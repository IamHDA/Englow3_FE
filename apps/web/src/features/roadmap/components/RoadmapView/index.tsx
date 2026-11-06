"use client";

import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Check, Flag, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LevelCheckPurpose,
  MilestoneKind,
  MilestoneStatus,
  RoadmapGoalType,
  RoadmapSchedule,
  RoadmapStageStatus,
  RoadmapStatus,
} from "@/lib/graphql/generated/schemaTypes";
import type { RoadmapFieldsFragment } from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useAbandonRoadmapMutation,
  useCreateRoadmapMutation,
  useLearnerRoadmapQuery,
  useStartLevelCheckMutation,
} from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import {
  ADJUSTMENT_LABELS,
  CONTENT_KIND_LABELS,
  GENERIC_ROADMAP_ERROR,
  ROADMAP_ERROR_MESSAGES,
  contentHref,
} from "../../constants/roadmap";

type Stage = RoadmapFieldsFragment["stages"][number];

/** How often to look again while the AI is planning. */
const POLL_MS = 5000;

function formatDate(value: string | null | undefined, isVi: boolean) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    isVi ? "vi-VN" : "en-GB",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );
}

/**
 * Lộ trình của người học: mục tiêu, các giai đoạn (mỗi giai đoạn gồm các bài
 * cần làm và một mốc kiểm tra cuối), và lý do lộ trình đổi gần đây. Tiến độ
 * từng bài tính từ hoạt động thật mỗi lần mở trang.
 */
export function RoadmapView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, loading, error, refetch, startPolling, stopPolling } =
    useLearnerRoadmapQuery({ fetchPolicy: "network-only" });
  const [createRoadmap, createState] = useCreateRoadmapMutation();
  const [abandonRoadmap, abandonState] = useAbandonRoadmapMutation();
  const [startLevelCheck, levelCheckState] = useStartLevelCheckMutation();

  const roadmap = data?.roadmap ?? null;
  const waiting =
    roadmap != null &&
    (roadmap.status === RoadmapStatus.GENERATING || roadmap.adjusting);
  useEffect(() => {
    if (waiting) startPolling(POLL_MS);
    else stopPolling();
  }, [waiting, startPolling, stopPolling]);

  function explain(failure: unknown) {
    const code = backendCodeOf(failure);
    const words =
      (code && ROADMAP_ERROR_MESSAGES[code]) || GENERIC_ROADMAP_ERROR;
    setErrorMessage(isVi ? words.vi : words.en);
  }

  async function handleCreate() {
    setErrorMessage(null);
    try {
      await createRoadmap();
      await refetch();
    } catch (failure) {
      explain(failure);
    }
  }

  async function handleAbandon() {
    if (
      !window.confirm(
        tr(
          "Tắt lộ trình? Việc cần làm hôm nay sẽ quay về gợi ý chung.",
          "Turn the roadmap off? Today's tasks go back to general suggestions.",
        ),
      )
    ) {
      return;
    }
    setErrorMessage(null);
    try {
      await abandonRoadmap();
      await refetch();
    } catch (failure) {
      explain(failure);
    }
  }

  async function handleLevelCheck(milestoneId: string) {
    setErrorMessage(null);
    try {
      await startLevelCheck({
        variables: { purpose: LevelCheckPurpose.MILESTONE, milestoneId },
      });
      router.push("/study/level-check");
    } catch (failure) {
      explain(failure);
    }
  }

  const header = (
    <PageHeader
      title={tr("Lộ trình học", "Learning roadmap")}
      actions={
        roadmap?.status === RoadmapStatus.ACTIVE && (
          <Button
            variant="subtle"
            color="gray"
            loading={abandonState.loading}
            onClick={() => void handleAbandon()}
          >
            {tr("Tắt lộ trình", "Turn off")}
          </Button>
        )
      }
    />
  );

  if (loading && !data) {
    return (
      <Page>
        {header}
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      </Page>
    );
  }

  if (error && !data) {
    return (
      <Page>
        {header}
        <Alert color="warn" radius="lg">
          {tr("Không tải được lộ trình.", "Could not load your roadmap.")}
          <Button
            variant="light"
            ml="sm"
            onClick={() => void refetch().catch(() => {})}
          >
            {tr("Thử lại", "Retry")}
          </Button>
        </Alert>
      </Page>
    );
  }

  const errorAlert = errorMessage && (
    <Alert color="warn" radius="md">
      {errorMessage}
    </Alert>
  );

  if (
    roadmap == null ||
    roadmap.status === RoadmapStatus.ABANDONED ||
    roadmap.status === RoadmapStatus.SUPERSEDED ||
    roadmap.status === RoadmapStatus.FAILED
  ) {
    const failed = roadmap?.status === RoadmapStatus.FAILED;
    return (
      <Page>
        {header}
        <Card withBorder radius="lg">
          <Stack gap="md" align="flex-start">
            <Title order={2} size="h3">
              {failed
                ? tr("Chưa tạo được lộ trình", "Your roadmap could not be made")
                : tr(
                    "Lộ trình theo mục tiêu của bạn",
                    "A roadmap to your goal",
                  )}
            </Title>
            <Text c="dimmed">
              {failed
                ? tr(
                    "Hệ thống chưa lập được kế hoạch hợp lệ cho mục tiêu này. Bạn có thể thử lại.",
                    "The system could not make a valid plan for this goal. You can try again.",
                  )
                : tr(
                    "Hệ thống chia đường tới mục tiêu thành các giai đoạn, chọn bài học vừa với thời gian bạn có mỗi ngày, và đặt một bài kiểm tra cuối mỗi giai đoạn.",
                    "The system splits the way to your goal into stages, picks lessons that fit your daily time, and closes each stage with a test.",
                  )}
            </Text>
            {errorAlert}
            <Button
              color="orange"
              loading={createState.loading}
              onClick={() => void handleCreate()}
            >
              {failed
                ? tr("Thử tạo lại", "Try again")
                : tr("Tạo lộ trình", "Make my roadmap")}
            </Button>
          </Stack>
        </Card>
      </Page>
    );
  }

  if (roadmap.status === RoadmapStatus.GENERATING) {
    return (
      <Page>
        {header}
        <Card withBorder radius="lg">
          <Group gap="md">
            <Loader size="sm" />
            <Text>
              {tr(
                "Đang lập lộ trình cho bạn, thường mất dưới một phút...",
                "Making your roadmap, usually under a minute...",
              )}
            </Text>
          </Group>
        </Card>
      </Page>
    );
  }

  const goal =
    roadmap.goalType === RoadmapGoalType.CERTIFICATE
      ? `${roadmap.targetCertificate} ${roadmap.targetScore}`
      : `${tr("Trình độ", "Level")} ${roadmap.targetLevel}`;
  const current = roadmap.stages.find(
    (stage) => stage.status === RoadmapStageStatus.CURRENT,
  );

  return (
    <Page>
      {header}
      <Stack gap="lg">
        <Card withBorder radius="lg">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                {tr("Mục tiêu", "Goal")}
              </Text>
              <Title order={2} size="h3">
                {roadmap.startLevel} → {goal}
              </Title>
              <Text size="sm" c="dimmed">
                {roadmap.targetDate
                  ? `${tr("Hạn", "Deadline")}: ${formatDate(roadmap.targetDate, isVi)} · `
                  : ""}
                {roadmap.dailyMinutes ?? 30}{" "}
                {tr("phút mỗi ngày", "minutes a day")}
              </Text>
            </Stack>
            <Group gap="xs">
              {roadmap.status === RoadmapStatus.COMPLETED ? (
                <Badge color="teal" size="lg">
                  {tr("Đã hoàn thành", "Completed")}
                </Badge>
              ) : roadmap.schedule === RoadmapSchedule.BEHIND ? (
                <Badge color="yellow" size="lg">
                  {tr("Chậm hơn kế hoạch", "Behind schedule")}
                </Badge>
              ) : (
                <Badge color="teal" variant="light" size="lg">
                  {tr("Đúng kế hoạch", "On track")}
                </Badge>
              )}
            </Group>
          </Group>
        </Card>

        {roadmap.adjusting && (
          <Alert color="blue" radius="md" icon={<Loader size="xs" />}>
            {tr(
              "Đang điều chỉnh các giai đoạn còn lại. Bạn vẫn học theo lộ trình hiện tại trong lúc chờ.",
              "Adjusting the remaining stages. Keep going with the current plan meanwhile.",
            )}
          </Alert>
        )}
        {errorAlert}

        {roadmap.stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            isCurrent={stage.id === current?.id}
            startingLevelCheck={levelCheckState.loading}
            onLevelCheck={(milestoneId) => void handleLevelCheck(milestoneId)}
          />
        ))}

        {roadmap.adjustments.length > 0 && (
          <Card withBorder radius="lg">
            <Stack gap="xs">
              <Title order={3} size="h4">
                {tr("Lộ trình đã thay đổi", "How your roadmap changed")}
              </Title>
              {roadmap.adjustments.map((adjustment) => (
                <Group
                  key={`${adjustment.reason}-${adjustment.createdAt}`}
                  justify="space-between"
                >
                  <Text size="sm">
                    {isVi
                      ? ADJUSTMENT_LABELS[adjustment.reason].vi
                      : ADJUSTMENT_LABELS[adjustment.reason].en}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(adjustment.createdAt).toLocaleDateString(
                      isVi ? "vi-VN" : "en-GB",
                    )}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Page>
  );
}

type StageCardProps = {
  stage: Stage;
  isCurrent: boolean;
  startingLevelCheck: boolean;
  onLevelCheck: (milestoneId: string) => void;
};

function StageCard({
  stage,
  isCurrent,
  startingLevelCheck,
  onLevelCheck,
}: StageCardProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const passed = stage.status === RoadmapStageStatus.PASSED;
  const locked = stage.status === RoadmapStageStatus.LOCKED;
  const milestone = stage.milestone;
  const firstUndone = stage.items.find((item) => !item.done);

  return (
    <Card
      withBorder
      radius="lg"
      style={
        isCurrent ? { borderColor: "var(--mantine-color-orange-6)" } : undefined
      }
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Group gap="xs">
              {passed ? (
                <Check size={16} aria-hidden="true" />
              ) : locked ? (
                <Lock size={16} aria-hidden="true" />
              ) : null}
              <Title order={3} size="h4">
                {tr("Giai đoạn", "Stage")} {stage.orderNo}: {stage.title}
              </Title>
            </Group>
            <Text size="xs" c="dimmed">
              {stage.fromLevel} → {stage.toLevel} ·{" "}
              {formatDate(stage.plannedStart, isVi)} -{" "}
              {formatDate(stage.plannedEnd, isVi)}
            </Text>
          </Stack>
          <Badge
            color={passed ? "teal" : isCurrent ? "orange" : "gray"}
            variant={isCurrent ? "filled" : "light"}
          >
            {passed
              ? tr("Đã qua", "Passed")
              : isCurrent
                ? tr("Đang học", "Current")
                : tr("Sắp tới", "Upcoming")}
          </Badge>
        </Group>

        {stage.summary && (
          <Text size="sm" c="dimmed">
            {stage.summary}
          </Text>
        )}
        {!locked && (
          <Progress
            value={stage.percentDone}
            color={passed ? "teal" : "orange"}
            aria-label={tr("Tiến độ giai đoạn", "Stage progress")}
          />
        )}

        {!locked && (
          <Stack gap={6}>
            {stage.items.map((item) => (
              <Group key={item.id} justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  {item.done ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <Text size="xs" c="dimmed" w={14}>
                      •
                    </Text>
                  )}
                  <Anchor
                    component={Link}
                    href={contentHref(item.kind, item.contentId, item.skill)}
                    size="sm"
                    c={item.done ? "dimmed" : undefined}
                  >
                    {item.title}
                  </Anchor>
                  <Text size="xs" c="dimmed">
                    {isVi
                      ? CONTENT_KIND_LABELS[item.kind].vi
                      : CONTENT_KIND_LABELS[item.kind].en}
                    {item.required ? "" : ` · ${tr("thêm", "extra")}`}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  {tr("Tuần", "Week")} {item.plannedWeek} · {item.percentDone}%
                </Text>
              </Group>
            ))}
          </Stack>
        )}

        {milestone && (
          <Card radius="md" bg="gray.0" p="sm">
            <Group justify="space-between" align="center">
              <Group gap="xs" wrap="nowrap">
                <Flag size={16} aria-hidden="true" />
                <Stack gap={0}>
                  <Text size="sm" fw={600}>
                    {milestone.kind === MilestoneKind.CERTIFICATE_MOCK
                      ? tr(
                          `Thi thử đạt ${milestone.requiredScore}`,
                          `Mock test: reach ${milestone.requiredScore}`,
                        )
                      : tr(
                          `Bài đo trình độ đạt ${milestone.requiredLevel}`,
                          `Level test: reach ${milestone.requiredLevel}`,
                        )}
                  </Text>
                  {milestone.status !== MilestoneStatus.PENDING && (
                    <Text size="xs" c="dimmed">
                      {tr("Lần gần nhất", "Last result")}:{" "}
                      {milestone.resultScore ?? milestone.resultLevel}
                      {milestone.status === MilestoneStatus.FAILED
                        ? ` · ${tr("chưa đạt", "not yet")}`
                        : ` · ${tr("đạt", "passed")}`}
                    </Text>
                  )}
                  {isCurrent && !milestone.ready && (
                    <Text size="xs" c="dimmed">
                      {tr(
                        "Mở khi bạn làm xong các bài bắt buộc.",
                        "Opens once the required lessons are done.",
                      )}
                    </Text>
                  )}
                </Stack>
              </Group>
              {isCurrent &&
                milestone.status !== MilestoneStatus.PASSED &&
                (milestone.kind === MilestoneKind.CERTIFICATE_MOCK &&
                (milestone.fullTestId || milestone.examId) ? (
                  <Button
                    component={Link}
                    href={
                      // An IELTS mock is a four-skill full test; TOEIC's is a paper.
                      milestone.fullTestId
                        ? `/exams/full-tests/${milestone.fullTestId}`
                        : `/exams/${milestone.examId}`
                    }
                    color={milestone.ready ? "orange" : undefined}
                    variant={milestone.ready ? "filled" : "light"}
                  >
                    {tr("Làm đề thi thử", "Take the mock test")}
                  </Button>
                ) : milestone.kind === MilestoneKind.LEVEL_CHECK ? (
                  <Button
                    color={milestone.ready ? "orange" : undefined}
                    variant={milestone.ready ? "filled" : "light"}
                    loading={startingLevelCheck}
                    onClick={() => onLevelCheck(milestone.id)}
                  >
                    {tr("Làm bài đo trình độ", "Take the level test")}
                  </Button>
                ) : null)}
            </Group>
          </Card>
        )}

        {isCurrent && firstUndone && !milestone?.ready && (
          <Group>
            <Button
              component={Link}
              href={contentHref(
                firstUndone.kind,
                firstUndone.contentId,
                firstUndone.skill,
              )}
              color="orange"
            >
              {tr("Học tiếp", "Continue")}: {firstUndone.title}
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
