import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { Alert, View } from "react-native";

import {
  ADJUSTMENT_LABELS,
  CONTENT_KIND_LABELS,
  ROADMAP_ERRORS,
  contentHref,
} from "@/features/roadmap/roadmap";
import { formatDate } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  LevelCheckPurpose,
  MilestoneKind,
  MilestoneStatus,
  RoadmapStageStatus,
  RoadmapStatus,
  useAbandonRoadmapMutation,
  useCreateRoadmapMutation,
  useLearnerRoadmapQuery,
  useStartLevelCheckMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  ListItem,
  LoadingState,
  Notice,
  ProgressBar,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

export default function RoadmapScreen() {
  const roadmap = useLearnerRoadmapQuery({ fetchPolicy: "cache-and-network" });
  const [create, createState] = useCreateRoadmapMutation();
  const [abandon, abandonState] = useAbandonRoadmapMutation();
  const [startLevelCheck, levelCheckState] = useStartLevelCheckMutation();
  const plan = roadmap.data?.roadmap ?? null;
  const generating =
    plan?.status === RoadmapStatus.GENERATING || plan?.adjusting;
  const { startPolling, stopPolling } = roadmap;

  useEffect(() => {
    if (!generating) return;
    startPolling(5000);
    return () => stopPolling();
  }, [generating, startPolling, stopPolling]);

  const actionError =
    createState.error ?? abandonState.error ?? levelCheckState.error;

  async function takeLevelCheck(milestoneId: string) {
    try {
      await startLevelCheck({
        variables: { purpose: LevelCheckPurpose.MILESTONE, milestoneId },
      });
      router.push("/study/level-check");
    } catch {
      // levelCheckState.error renders above
    }
  }

  return (
    <Screen
      refreshing={roadmap.loading && Boolean(roadmap.data)}
      onRefresh={() => void roadmap.refetch()}
    >
      <Stack.Screen options={{ title: "Lộ trình học" }} />
      <Notice
        message={actionError ? errorMessage(actionError, ROADMAP_ERRORS) : null}
      />

      {roadmap.loading && !roadmap.data ? (
        <LoadingState />
      ) : roadmap.error && !roadmap.data ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={errorMessage(roadmap.error)}
          action={
            <Button title="Thử lại" onPress={() => void roadmap.refetch()} />
          }
        />
      ) : !plan ||
        plan.status === RoadmapStatus.ABANDONED ||
        plan.status === RoadmapStatus.FAILED ? (
        <EmptyState
          icon="map-outline"
          title={
            plan?.status === RoadmapStatus.FAILED
              ? "Chưa lập được lộ trình"
              : "Bạn chưa có lộ trình"
          }
          message={
            plan?.failureCode
              ? (ROADMAP_ERRORS[plan.failureCode] ?? "Hãy thử tạo lại.")
              : "Englow3 sẽ chia mục tiêu của bạn thành từng giai đoạn với bài học mỗi tuần."
          }
          action={
            <View style={{ gap: spacing.sm, alignSelf: "stretch" }}>
              <Button
                title="Tạo lộ trình"
                icon="sparkles"
                loading={createState.loading}
                onPress={() =>
                  void create()
                    .then(() => roadmap.refetch())
                    .catch(() => undefined)
                }
              />
              <Button
                title="Cập nhật mục tiêu"
                variant="ghost"
                onPress={() => router.push("/onboarding")}
              />
            </View>
          }
        />
      ) : generating ? (
        <LoadingState
          label={
            plan.adjusting
              ? "Đang điều chỉnh lộ trình…"
              : "AI đang lập lộ trình cho bạn…"
          }
        />
      ) : (
        <>
          <Card style={{ marginBottom: spacing.lg }}>
            <AppText variant="heading">
              {plan.targetCertificate
                ? `${plan.targetCertificate} ${plan.targetScore ?? ""}`
                : `Đạt ${plan.targetLevel ?? ""}`}
            </AppText>
            <AppText tone="muted">
              {[
                plan.startLevel ? `Bắt đầu ${plan.startLevel}` : null,
                plan.targetDate ? `hạn ${formatDate(plan.targetDate)}` : null,
                plan.dailyMinutes ? `${plan.dailyMinutes} phút/ngày` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </AppText>
            {plan.status === RoadmapStatus.COMPLETED ? (
              <View style={{ marginTop: spacing.sm }}>
                <Badge label="Đã hoàn thành lộ trình 🎉" tone="success" />
              </View>
            ) : null}
          </Card>

          {[...plan.stages]
            .sort((a, b) => a.orderNo - b.orderNo)
            .map((stage) => {
              const current = stage.status === RoadmapStageStatus.CURRENT;
              const locked = stage.status === RoadmapStageStatus.LOCKED;
              const milestone = stage.milestone;
              return (
                <Section
                  key={stage.id}
                  title={`${stage.orderNo}. ${stage.title}`}
                  action={
                    <Badge
                      label={
                        current ? "Đang học" : locked ? "Chưa mở" : "Đã qua"
                      }
                      tone={current ? "accent" : locked ? "neutral" : "success"}
                    />
                  }
                >
                  <AppText tone="muted" style={{ marginBottom: spacing.xs }}>
                    {stage.summary}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {stage.fromLevel} → {stage.toLevel}
                    {stage.plannedEnd
                      ? ` · đến ${formatDate(stage.plannedEnd)}`
                      : ""}
                  </AppText>
                  <View style={{ marginVertical: spacing.sm }}>
                    <ProgressBar
                      value={stage.percentDone / 100}
                      color={colors.success}
                    />
                  </View>

                  {!locked
                    ? stage.items.map((item) => (
                        <ListItem
                          key={item.id}
                          icon={
                            item.done ? "checkmark-circle" : "ellipse-outline"
                          }
                          iconColor={
                            item.done ? colors.success : colors.primary
                          }
                          title={item.title}
                          subtitle={[
                            CONTENT_KIND_LABELS[item.kind],
                            item.required ? "bắt buộc" : "tự chọn",
                            `${item.estimatedMinutes} phút`,
                            `${item.percentDone}%`,
                          ].join(" · ")}
                          onPress={() =>
                            router.push(
                              contentHref(
                                item.kind,
                                item.contentId,
                                item.skill,
                              ),
                            )
                          }
                        />
                      ))
                    : null}

                  {milestone ? (
                    <Card
                      style={{
                        borderColor:
                          milestone.ready && current
                            ? colors.accent
                            : colors.border,
                      }}
                    >
                      <Row>
                        <Ionicons name="flag" size={20} color={colors.accent} />
                        <AppText variant="label" style={{ flex: 1 }}>
                          {milestone.kind === MilestoneKind.LEVEL_CHECK
                            ? `Đạt trình độ ${milestone.requiredLevel ?? ""}`
                            : `Đạt ${milestone.requiredScore ?? ""} điểm thi thử`}
                        </AppText>
                        {milestone.status === MilestoneStatus.PASSED ? (
                          <Badge label="Đạt" tone="success" />
                        ) : null}
                      </Row>
                      {milestone.attemptCount > 0 ? (
                        <AppText variant="caption" tone="muted">
                          Lần gần nhất:{" "}
                          {milestone.resultScore ?? milestone.resultLevel}
                          {milestone.status === MilestoneStatus.FAILED
                            ? " · chưa đạt"
                            : ""}
                        </AppText>
                      ) : null}
                      {current && !milestone.ready ? (
                        <AppText variant="caption" tone="muted">
                          Mở khi bạn làm xong các bài bắt buộc.
                        </AppText>
                      ) : null}
                      {current &&
                      milestone.status !== MilestoneStatus.PASSED ? (
                        milestone.kind === MilestoneKind.CERTIFICATE_MOCK &&
                        (milestone.fullTestId || milestone.examId) ? (
                          <Button
                            title="Làm đề thi thử"
                            variant={milestone.ready ? "accent" : "secondary"}
                            size="sm"
                            style={{ marginTop: spacing.sm }}
                            onPress={() =>
                              router.push(
                                milestone.fullTestId
                                  ? {
                                      pathname: "/exams/full-tests/[id]",
                                      params: { id: milestone.fullTestId },
                                    }
                                  : {
                                      pathname: "/exams/[id]",
                                      params: { id: milestone.examId ?? "" },
                                    },
                              )
                            }
                          />
                        ) : milestone.kind === MilestoneKind.LEVEL_CHECK ? (
                          <Button
                            title="Làm bài đo trình độ"
                            variant={milestone.ready ? "accent" : "secondary"}
                            size="sm"
                            loading={levelCheckState.loading}
                            style={{ marginTop: spacing.sm }}
                            onPress={() => void takeLevelCheck(milestone.id)}
                          />
                        ) : null
                      ) : null}
                    </Card>
                  ) : null}
                </Section>
              );
            })}

          {plan.adjustments.length > 0 ? (
            <Section title="Điều chỉnh gần đây">
              {plan.adjustments.slice(0, 5).map((adjustment) => (
                <AppText
                  key={adjustment.createdAt}
                  variant="caption"
                  tone="muted"
                >
                  {formatDate(adjustment.createdAt)} ·{" "}
                  {ADJUSTMENT_LABELS[adjustment.reason]}
                </AppText>
              ))}
            </Section>
          ) : null}

          <Button
            title="Huỷ lộ trình"
            variant="ghost"
            loading={abandonState.loading}
            onPress={() =>
              Alert.alert(
                "Huỷ lộ trình?",
                "Tiến độ đã học vẫn được giữ, nhưng Englow3 sẽ ngừng gợi ý theo lộ trình này.",
                [
                  { text: "Giữ lại", style: "cancel" },
                  {
                    text: "Huỷ lộ trình",
                    style: "destructive",
                    onPress: () =>
                      void abandon()
                        .then(() => roadmap.refetch())
                        .catch(() => undefined),
                  },
                ],
              )
            }
          />
        </>
      )}
    </Screen>
  );
}
