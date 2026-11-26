import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Alert, View } from "react-native";

import {
  GRADING_LABELS,
  SITTING_STATUS,
  SLOT_LABELS,
} from "@/features/fullTest/labels";
import { formatDateTime } from "@/features/shared/labels";
import { backendCodeOf, errorMessage } from "@/lib/errors";
import {
  FullTestPartGrading,
  FullTestSittingStatus,
  OpenAttemptChoice,
  useFullTestSittingQuery,
  useStartFullTestPaperMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Notice,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, spacing } from "@/ui/theme";

export default function FullTestSittingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sitting = useFullTestSittingQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  const [startPaper, paperState] = useStartFullTestPaperMutation();
  const current = sitting.data?.fullTestSitting;
  const grading =
    current?.status === FullTestSittingStatus.AWAITING_GRADES ||
    current?.parts.some((part) => part.grading === FullTestPartGrading.GRADING);
  const { startPolling, stopPolling } = sitting;

  useEffect(() => {
    if (!grading) return;
    startPolling(10_000);
    return () => stopPolling();
  }, [grading, startPolling, stopPolling]);

  async function openPaper(onOpen?: OpenAttemptChoice) {
    try {
      const { data } = await startPaper({
        variables: { sittingId: id, ...(onOpen ? { onOpen } : {}) },
      });
      if (data) {
        router.push({
          pathname: "/exams/sitting/[attemptId]",
          params: {
            attemptId: data.startFullTestPaper.id,
            fullTestSitting: id,
          },
        });
      }
    } catch (failure) {
      if (backendCodeOf(failure) === "ATTEMPT_IN_PROGRESS") {
        Alert.alert(
          "Bạn đang có một lượt làm dở",
          "Tiếp tục lượt cũ hay làm lại từ đầu?",
          [
            { text: "Huỷ", style: "cancel" },
            {
              text: "Làm lại",
              style: "destructive",
              onPress: () => void openPaper(OpenAttemptChoice.REPLACE),
            },
            {
              text: "Tiếp tục",
              onPress: () => void openPaper(OpenAttemptChoice.RESUME),
            },
          ],
        );
      }
    }
  }

  return (
    <Screen
      refreshing={sitting.loading && Boolean(sitting.data)}
      onRefresh={() => void sitting.refetch()}
    >
      <Stack.Screen options={{ title: current?.title ?? "Full Test" }} />
      <QueryView
        loading={sitting.loading}
        error={sitting.error}
        data={current}
        onRetry={() => void sitting.refetch()}
      >
        {(item) => {
          const open = item.status === FullTestSittingStatus.IN_PROGRESS;
          const bands: [string, number | null | undefined][] = [
            ["Nghe", item.listeningBand],
            ["Đọc", item.readingBand],
            ["Viết", item.writingBand],
            ["Nói", item.speakingBand],
          ];
          return (
            <>
              <Card style={{ alignItems: "center", marginBottom: spacing.lg }}>
                <Badge
                  label={SITTING_STATUS[item.status].label}
                  tone={SITTING_STATUS[item.status].tone}
                />
                <AppText
                  variant="title"
                  tone="primary"
                  style={{ marginTop: spacing.sm }}
                >
                  {item.overallBand ?? item.provisionalBand ?? "—"}
                </AppText>
                <AppText tone="muted">
                  {item.overallBand != null
                    ? "Band tổng"
                    : item.provisionalBand != null
                      ? "Band tạm tính"
                      : "Chưa có band"}
                </AppText>
                <Row gap={spacing.lg} style={{ marginTop: spacing.md }}>
                  {bands.map(([label, band]) => (
                    <View key={label} style={{ alignItems: "center" }}>
                      <AppText variant="label">{band ?? "—"}</AppText>
                      <AppText variant="caption" tone="muted">
                        {label}
                      </AppText>
                    </View>
                  ))}
                </Row>
                {open && item.deadlineAt ? (
                  <AppText
                    variant="caption"
                    tone="muted"
                    style={{ marginTop: spacing.sm }}
                  >
                    Hạn hoàn thành: {formatDateTime(item.deadlineAt)}
                  </AppText>
                ) : null}
                {item.bandRevision > 0 && item.revisedAt ? (
                  <AppText variant="caption" tone="muted">
                    Điểm được chấm lại lúc {formatDateTime(item.revisedAt)}
                  </AppText>
                ) : null}
              </Card>
              {item.status === FullTestSittingStatus.EXPIRED ? (
                <Notice message="Lượt thi đã hết hạn. Các phần đã làm vẫn được chấm." />
              ) : null}
              <Notice
                message={
                  paperState.error &&
                  backendCodeOf(paperState.error) !== "ATTEMPT_IN_PROGRESS"
                    ? errorMessage(paperState.error)
                    : null
                }
              />

              <Section title="Các phần thi">
                <PartRow
                  title="Listening & Reading"
                  done={Boolean(item.examAttemptId)}
                  status={item.examAttemptId ? "Đã nộp" : "Chưa làm"}
                  action={
                    item.examAttemptId ? (
                      <Button
                        title="Xem kết quả"
                        size="sm"
                        variant="secondary"
                        onPress={() =>
                          router.push({
                            pathname: "/exams/result/[attemptId]",
                            params: { attemptId: item.examAttemptId ?? "" },
                          })
                        }
                      />
                    ) : open ? (
                      <Button
                        title="Làm bài"
                        size="sm"
                        loading={paperState.loading}
                        onPress={() => void openPaper()}
                      />
                    ) : null
                  }
                />
                {item.parts.map((part) => {
                  const slot = SLOT_LABELS[part.slot];
                  const done = part.attemptId != null && part.grading != null;
                  return (
                    <PartRow
                      key={part.slot}
                      title={slot.title}
                      done={part.grading === FullTestPartGrading.GRADED}
                      status={
                        part.grading
                          ? GRADING_LABELS[part.grading]
                          : part.attemptId
                            ? "Đang làm"
                            : "Chưa làm"
                      }
                      action={
                        done && part.attemptId ? (
                          <Button
                            title="Xem bài"
                            size="sm"
                            variant="secondary"
                            onPress={() =>
                              router.push({
                                pathname: "/study/assessments/attempts/[id]",
                                params: { id: part.attemptId ?? "" },
                              })
                            }
                          />
                        ) : open ? (
                          <Button
                            title={part.attemptId ? "Tiếp tục" : "Làm bài"}
                            size="sm"
                            onPress={() =>
                              part.attemptId
                                ? router.push({
                                    pathname:
                                      "/study/assessments/attempts/[id]",
                                    params: { id: part.attemptId },
                                  })
                                : router.push({
                                    pathname:
                                      slot.skill === "WRITING"
                                        ? "/study/writing/[id]"
                                        : "/study/speaking/[id]",
                                    params: {
                                      id: part.taskId,
                                      fullTestSitting: item.id,
                                      slot: part.slot,
                                    },
                                  })
                            }
                          />
                        ) : null
                      }
                    />
                  );
                })}
              </Section>
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}

function PartRow({
  title,
  done,
  status,
  action,
}: {
  title: string;
  done: boolean;
  status: string;
  action: React.ReactNode;
}) {
  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <Row>
        <Ionicons
          name={done ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={done ? colors.success : colors.textFaint}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="label">{title}</AppText>
          <AppText variant="caption" tone="muted">
            {status}
          </AppText>
        </View>
        {action}
      </Row>
    </Card>
  );
}
