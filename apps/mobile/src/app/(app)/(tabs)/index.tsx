import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { StartCard } from "@/features/tour/StartCard";
import { isBackOfficeRole, useAuth } from "@/features/auth/AuthProvider";
import {
  QUEST_LABELS,
  TASK_KIND_ICONS,
  TASK_KIND_LABELS,
  TASK_UNIT_LABELS,
  levelTitle,
  taskHref,
} from "@/features/study/dailyPath";
import {
  DailyTaskStatus,
  OnboardingStep,
  useDailyPathQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  ListItem,
  ProgressBar,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, spacing } from "@/ui/theme";

export default function HomeScreen() {
  const { me } = useAuth();
  const daily = useDailyPathQuery({ fetchPolicy: "cache-and-network" });
  const offeredOnboarding = useRef(false);

  const onboardingDone = me?.onboardingStep === OnboardingStep.COMPLETED;
  const backOffice = isBackOfficeRole(me?.role);

  // Offer the set-up once per launch, as the web's dismissible dialog does.
  useEffect(() => {
    if (me && !onboardingDone && !backOffice && !offeredOnboarding.current) {
      offeredOnboarding.current = true;
      router.push("/onboarding");
    }
  }, [me, onboardingDone, backOffice]);

  useFocusEffect(
    useCallback(() => {
      void daily.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <Screen
      refreshing={daily.loading && Boolean(daily.data)}
      onRefresh={() => void daily.refetch()}
    >
      <AppText variant="title">Chào {me?.displayName ?? "bạn"} 👋</AppText>
      <AppText tone="muted" style={{ marginBottom: spacing.lg }}>
        Hôm nay mình học gì nhé?
      </AppText>

      {!onboardingDone && !backOffice ? (
        <Card style={styles.banner} onPress={() => router.push("/onboarding")}>
          <Row>
            <Ionicons name="sparkles" size={22} color={colors.accent} />
            <View style={styles.flex}>
              <AppText variant="label">Hoàn tất thiết lập lộ trình</AppText>
              <AppText variant="caption" tone="muted">
                Vài câu hỏi ngắn để Englow3 cá nhân hoá bài học cho bạn.
              </AppText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textFaint}
            />
          </Row>
        </Card>
      ) : null}

      <StartCard />

      {backOffice ? (
        <ListItem
          icon="shield-checkmark-outline"
          title="Khu quản trị"
          subtitle="Duyệt bài, chấm bài, quản lý nội dung và người dùng"
          onPress={() => router.push("/admin")}
        />
      ) : null}

      <QueryView
        loading={daily.loading}
        error={daily.error}
        data={daily.data?.dailyPath}
        onRetry={() => void daily.refetch()}
      >
        {(path) => (
          <>
            <Card style={styles.stats}>
              <Row style={styles.statsRow}>
                <Stat
                  icon="flame"
                  color={colors.accent}
                  value={path.streakDays}
                  label="ngày liên tiếp"
                />
                <Stat
                  icon="star"
                  color={colors.primary}
                  value={path.totalXp}
                  label="XP"
                />
                <Stat
                  icon="trophy"
                  color={colors.success}
                  value={path.level}
                  label={levelTitle(path.level)}
                />
              </Row>
              <AppText
                variant="caption"
                tone="muted"
                style={{ marginTop: spacing.md }}
              >
                Cấp {path.level}: {path.xpIntoLevel}/{path.levelCostXp} XP
              </AppText>
              <View style={{ marginTop: spacing.xs }}>
                <ProgressBar
                  value={
                    path.levelCostXp > 0
                      ? path.xpIntoLevel / path.levelCostXp
                      : 0
                  }
                />
              </View>
            </Card>

            <Section
              title="Lộ trình hôm nay"
              action={
                <Button
                  title="Xem lộ trình"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push("/study/roadmap")}
                />
              }
            >
              {path.roadmapStageTitle ? (
                <AppText tone="muted" style={{ marginBottom: spacing.sm }}>
                  Giai đoạn: {path.roadmapStageTitle}
                </AppText>
              ) : null}
              {path.tasks.length === 0 ? (
                <Card>
                  <AppText tone="muted">
                    Chưa có bài nào cho hôm nay. Hãy tạo lộ trình hoặc chọn một
                    kỹ năng trong tab Học tập.
                  </AppText>
                </Card>
              ) : (
                [...path.tasks]
                  .sort((a, b) => a.order - b.order)
                  .map((task) => {
                    const done = task.status === DailyTaskStatus.COMPLETED;
                    const units =
                      task.unitsRemaining > 0
                        ? `Còn ${task.unitsRemaining} ${TASK_UNIT_LABELS[task.kind]}`
                        : done
                          ? "Đã xong"
                          : null;
                    return (
                      <ListItem
                        key={`${task.kind}-${task.targetId}-${task.order}`}
                        icon={
                          done ? "checkmark-circle" : TASK_KIND_ICONS[task.kind]
                        }
                        iconColor={done ? colors.success : colors.primary}
                        title={task.title}
                        subtitle={[
                          TASK_KIND_LABELS[task.kind],
                          units,
                          `+${task.xpReward} XP`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        onPress={() =>
                          router.push(taskHref(task.kind, task.targetId))
                        }
                        right={
                          task.status === DailyTaskStatus.CURRENT ? (
                            <Badge label="Tiếp theo" tone="accent" />
                          ) : undefined
                        }
                      />
                    );
                  })
              )}
            </Section>

            {path.quests.length > 0 ? (
              <Section title="Nhiệm vụ trong ngày">
                {path.quests.map((quest) => (
                  <Card key={quest.kind} style={styles.quest}>
                    <Row>
                      <Ionicons
                        name={
                          quest.completed
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={20}
                        color={
                          quest.completed ? colors.success : colors.textFaint
                        }
                      />
                      <AppText style={styles.flex}>
                        {QUEST_LABELS[quest.kind]}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        {quest.progress}/{quest.target}
                      </AppText>
                    </Row>
                    <View style={{ marginTop: spacing.sm }}>
                      <ProgressBar
                        value={
                          quest.target > 0 ? quest.progress / quest.target : 0
                        }
                        color={
                          quest.completed ? colors.success : colors.primary
                        }
                      />
                    </View>
                  </Card>
                ))}
              </Section>
            ) : null}
          </>
        )}
      </QueryView>

      <Section title="Lối tắt">
        <ListItem
          icon="sparkles-outline"
          title="Gia sư AI"
          subtitle="Hỏi đáp, luyện hội thoại"
          onPress={() => router.push("/ai-tutor")}
        />
        <ListItem
          icon="ribbon-outline"
          title="Kiểm tra trình độ"
          subtitle="Biết mình đang ở đâu"
          onPress={() => router.push("/study/level-check")}
        />
        <ListItem
          icon="albums-outline"
          title="Thẻ từ vựng"
          onPress={() => router.push("/study/flashcards")}
        />
      </Section>
    </Screen>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  banner: {
    marginBottom: spacing.lg,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentSoft,
  },
  stats: { marginBottom: spacing.xl },
  statsRow: { justifyContent: "space-around" },
  stat: { alignItems: "center", gap: 2, flex: 1 },
  quest: { marginBottom: spacing.sm },
});
