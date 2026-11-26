import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { ROADMAP_ERRORS } from "@/features/roadmap/roadmap";
import { CEFR_LABELS } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  LevelCheckPurpose,
  LevelCheckStatus,
  useLatestLevelCheckQuery,
  useSkipLevelCheckSpeakingMutation,
  useStartLevelCheckMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingState,
  Notice,
  Row,
  Screen,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

/**
 * The three-part level check: vocabulary and grammar plus listening as one
 * paper, then one spoken answer. Each part is taken on its ordinary screen;
 * this page shows progress and, while speech is being graded, polls for it.
 */
export default function LevelCheckScreen() {
  const { refetchMe } = useAuth();
  const latest = useLatestLevelCheckQuery({ fetchPolicy: "network-only" });
  const [skipSpeaking, skipState] = useSkipLevelCheckSpeakingMutation();
  const [start, startState] = useStartLevelCheckMutation();
  const check = latest.data?.latestLevelCheck ?? null;
  const { startPolling, stopPolling } = latest;

  const gradingSpeech =
    check != null &&
    check.status !== LevelCheckStatus.COMPLETED &&
    check.speakingAttemptId != null &&
    check.speakingLevel == null &&
    !check.speakingFailed &&
    !check.speakingSkipped;

  useEffect(() => {
    if (gradingSpeech) startPolling(4000);
    else stopPolling();
  }, [gradingSpeech, startPolling, stopPolling]);

  // A finished onboarding check moves the learner's onboarding on.
  useEffect(() => {
    if (check?.status === LevelCheckStatus.COMPLETED) void refetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check?.status]);

  const actionError = skipState.error ?? startState.error;

  return (
    <Screen
      refreshing={latest.loading && Boolean(latest.data)}
      onRefresh={() => void latest.refetch()}
    >
      <Stack.Screen options={{ title: "Kiểm tra trình độ" }} />
      <Notice
        message={actionError ? errorMessage(actionError, ROADMAP_ERRORS) : null}
      />
      {latest.loading && !latest.data ? (
        <LoadingState />
      ) : !check ? (
        <EmptyState
          icon="ribbon-outline"
          title="Bạn chưa làm bài kiểm tra trình độ"
          message="Bài gồm từ vựng - ngữ pháp, nghe và một câu trả lời nói. Kết quả giúp Englow3 xếp lộ trình đúng sức bạn."
          action={
            <Button
              title="Bắt đầu kiểm tra"
              loading={startState.loading}
              onPress={() =>
                void start({
                  variables: { purpose: LevelCheckPurpose.ONBOARDING },
                })
                  .then(() => latest.refetch())
                  .catch(() => undefined)
              }
            />
          }
        />
      ) : (
        <>
          {check.status === LevelCheckStatus.COMPLETED ? (
            <Card style={{ alignItems: "center", marginBottom: spacing.lg }}>
              <Ionicons name="ribbon" size={40} color={colors.accent} />
              <AppText variant="title">{check.resultLevel ?? "—"}</AppText>
              {check.resultLevel ? (
                <AppText tone="muted">
                  {CEFR_LABELS[check.resultLevel].label}
                </AppText>
              ) : null}
              <Button
                title="Xem lộ trình"
                style={{ marginTop: spacing.md }}
                onPress={() => router.replace("/study/roadmap")}
              />
            </Card>
          ) : check.provisionalLevel ? (
            <Notice
              tone="info"
              message={`Trình độ tạm tính: ${check.provisionalLevel}. Hoàn tất phần nói để có kết quả cuối.`}
            />
          ) : null}

          <Part
            step={1}
            title="Từ vựng, ngữ pháp và nghe"
            done={
              check.examAttemptId != null &&
              (check.vocabLevel != null || check.listeningLevel != null)
            }
            result={[
              check.vocabLevel && `Từ vựng ${check.vocabLevel}`,
              check.listeningLevel && `Nghe ${check.listeningLevel}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          >
            {check.status === LevelCheckStatus.IN_PROGRESS && check.examId ? (
              <Button
                title={check.examAttemptId ? "Tiếp tục bài làm" : "Làm bài"}
                size="sm"
                onPress={() =>
                  router.push({
                    pathname: "/exams/[id]",
                    params: { id: check.examId ?? "" },
                  })
                }
              />
            ) : null}
          </Part>

          <Part
            step={2}
            title="Nói"
            done={check.speakingLevel != null || check.speakingSkipped}
            result={
              check.speakingLevel
                ? `Nói ${check.speakingLevel}`
                : check.speakingSkipped
                  ? "Đã bỏ qua"
                  : check.speakingFailed
                    ? "Chưa chấm được"
                    : gradingSpeech
                      ? "Đang chấm…"
                      : ""
            }
          >
            {check.status === LevelCheckStatus.AWAITING_SPEAKING &&
            check.speakingTaskId != null &&
            !gradingSpeech &&
            check.speakingLevel == null &&
            !check.speakingSkipped ? (
              <Row gap={spacing.sm}>
                <Button
                  title={check.speakingFailed ? "Nói lại" : "Trả lời phần nói"}
                  size="sm"
                  onPress={() =>
                    router.push({
                      pathname: "/study/speaking/[id]",
                      params: { id: check.speakingTaskId ?? "" },
                    })
                  }
                />
                <Button
                  title="Bỏ qua"
                  size="sm"
                  variant="ghost"
                  loading={skipState.loading}
                  onPress={() =>
                    void skipSpeaking({ variables: { id: check.id } }).catch(
                      () => undefined,
                    )
                  }
                />
              </Row>
            ) : null}
          </Part>
        </>
      )}
    </Screen>
  );
}

function Part({
  step,
  title,
  done,
  result,
  children,
}: {
  step: number;
  title: string;
  done: boolean;
  result: string;
  children?: React.ReactNode;
}) {
  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Row>
        <Ionicons
          name={done ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={done ? colors.success : colors.textFaint}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="label">
            Phần {step}: {title}
          </AppText>
          {result ? (
            <AppText variant="caption" tone="muted">
              {result}
            </AppText>
          ) : null}
        </View>
        {done ? <Badge label="Xong" tone="success" /> : null}
      </Row>
      {children ? (
        <View style={{ marginTop: spacing.sm }}>{children}</View>
      ) : null}
    </Card>
  );
}
