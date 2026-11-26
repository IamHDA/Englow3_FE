import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { errorMessage } from "@/lib/errors";
import {
  TranslationAttemptStatus,
  TranslationVerdict,
  useSubmitTranslationMutation,
  useTranslationAttemptQuery,
  useTranslationSetQuery,
  type TranslationAttemptFieldsFragment,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingState,
  Notice,
  ProgressBar,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, radius, spacing } from "@/ui/theme";

const VERDICTS: Record<
  TranslationVerdict,
  { label: string; tone: "success" | "primary" | "accent" | "danger" }
> = {
  [TranslationVerdict.EXCELLENT]: { label: "Xuất sắc", tone: "success" },
  [TranslationVerdict.GOOD]: { label: "Tốt", tone: "primary" },
  [TranslationVerdict.PARTIAL]: { label: "Đúng một phần", tone: "accent" },
  [TranslationVerdict.NEEDS_WORK]: { label: "Cần sửa", tone: "danger" },
};

const PARTS: ["meaning" | "grammar" | "vocabulary" | "naturalness", string][] =
  [
    ["meaning", "Ý nghĩa"],
    ["grammar", "Ngữ pháp"],
    ["vocabulary", "Từ vựng"],
    ["naturalness", "Tự nhiên"],
  ];

export default function TranslationPracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const set = useTranslationSetQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  const [index, setIndex] = useState(0);

  return (
    <Screen>
      <Stack.Screen
        options={{ title: set.data?.translationSet.set.title ?? "Luyện dịch" }}
      />
      <QueryView
        loading={set.loading}
        error={set.error}
        data={set.data?.translationSet}
        onRetry={() => void set.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={<EmptyState title="Bộ này chưa có câu nào" />}
      >
        {(data) => {
          const items = [...data.items].sort((a, b) => a.orderNo - b.orderNo);
          const item = items[Math.min(index, items.length - 1)];
          if (!item) return null;
          const graded = items.filter(
            (entry) =>
              entry.latestAttempt?.status === TranslationAttemptStatus.GRADED,
          ).length;
          return (
            <>
              <Row style={{ marginBottom: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <ProgressBar
                    value={graded / items.length}
                    color={colors.success}
                  />
                </View>
                <AppText variant="caption" tone="muted">
                  Câu {index + 1}/{items.length}
                </AppText>
              </Row>
              <Row wrap gap={spacing.xs} style={{ marginBottom: spacing.md }}>
                {items.map((entry, position) => (
                  <Pressable
                    key={entry.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Câu ${position + 1}`}
                    onPress={() => setIndex(position)}
                    style={[
                      styles.dot,
                      entry.latestAttempt?.status ===
                        TranslationAttemptStatus.GRADED && styles.dotDone,
                      position === index && styles.dotCurrent,
                    ]}
                  >
                    <AppText variant="caption">{position + 1}</AppText>
                  </Pressable>
                ))}
              </Row>
              <TranslationItem
                key={item.id}
                itemId={item.id}
                sourceVi={item.sourceVi}
                latestAttemptId={item.latestAttempt?.id ?? null}
                onGraded={() => void set.refetch()}
                onNext={
                  index < items.length - 1
                    ? () => setIndex(index + 1)
                    : undefined
                }
              />
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}

function TranslationItem({
  itemId,
  sourceVi,
  latestAttemptId,
  onGraded,
  onNext,
}: {
  itemId: string;
  sourceVi: string;
  latestAttemptId: string | null;
  onGraded: () => void;
  onNext?: () => void;
}) {
  const [response, setResponse] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(latestAttemptId);
  const [submit, submitState] = useSubmitTranslationMutation();
  const attempt = useTranslationAttemptQuery({
    variables: { id: attemptId ?? "" },
    skip: attemptId === null,
    fetchPolicy: "cache-and-network",
  });
  const current = attempt.data?.translationAttempt;
  const queued = current?.status === TranslationAttemptStatus.QUEUED;
  const { startPolling, stopPolling } = attempt;

  useEffect(() => {
    if (!queued) return;
    startPolling(3000);
    return () => stopPolling();
  }, [queued, startPolling, stopPolling]);

  useEffect(() => {
    if (current?.status === TranslationAttemptStatus.GRADED) onGraded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.status]);

  async function send() {
    if (!response.trim()) return;
    try {
      const { data } = await submit({
        variables: { itemId, response: response.trim() },
      });
      if (data) setAttemptId(data.submitTranslation.id);
    } catch {
      // submitState.error renders below
    }
  }

  return (
    <>
      <Card style={{ marginBottom: spacing.md }}>
        <AppText variant="caption" tone="muted">
          Dịch sang tiếng Anh
        </AppText>
        <AppText variant="heading" selectable>
          {sourceVi}
        </AppText>
      </Card>
      <TextField
        value={response}
        onChangeText={setResponse}
        multiline
        placeholder="Bản dịch của bạn…"
        autoCorrect={false}
        accessibilityLabel="Bản dịch"
      />
      <Notice
        message={submitState.error ? errorMessage(submitState.error) : null}
      />
      <Button
        title="Chấm bản dịch"
        icon="sparkles"
        loading={submitState.loading}
        disabled={!response.trim() || queued}
        onPress={() => void send()}
      />

      {queued ? <LoadingState label="AI đang chấm bản dịch…" /> : null}
      {current?.status === TranslationAttemptStatus.FAILED ? (
        <Notice message="Chưa chấm được bản dịch này. Hãy thử gửi lại." />
      ) : null}
      {current?.status === TranslationAttemptStatus.GRADED ? (
        <Feedback attempt={current} />
      ) : null}

      {onNext ? (
        <Button
          title="Câu tiếp"
          variant="secondary"
          onPress={onNext}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </>
  );
}

function Feedback({ attempt }: { attempt: TranslationAttemptFieldsFragment }) {
  const feedback = attempt.feedback;
  return (
    <Card style={{ marginTop: spacing.lg }}>
      <Row style={{ justifyContent: "space-between" }}>
        {feedback ? (
          <Badge
            label={VERDICTS[feedback.verdict].label}
            tone={VERDICTS[feedback.verdict].tone}
          />
        ) : (
          <View />
        )}
        {attempt.score != null ? (
          <AppText variant="heading">{attempt.score}/100</AppText>
        ) : null}
      </Row>
      <AppText tone="muted" style={{ marginTop: spacing.xs }}>
        Bạn viết: “{attempt.response}”
      </AppText>
      {feedback ? (
        <>
          <AppText style={{ marginTop: spacing.sm }}>
            {feedback.summary}
          </AppText>
          {PARTS.map(([key, label]) => {
            const value = feedback.parts[key];
            return (
              <View key={key} style={{ marginTop: spacing.sm }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <AppText variant="caption" tone="muted">
                    {label}
                  </AppText>
                  <AppText variant="caption">{value}</AppText>
                </Row>
                <ProgressBar value={Number(value) / 100} />
              </View>
            );
          })}
          {feedback.errors.length > 0 ? (
            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              <AppText variant="label">Lỗi cần sửa</AppText>
              {feedback.errors.map((error, position) => (
                <View key={position} style={styles.error}>
                  <AppText>
                    <AppText
                      tone="danger"
                      style={{ textDecorationLine: "line-through" }}
                    >
                      {error.original}
                    </AppText>{" "}
                    → <AppText tone="success">{error.correction}</AppText>
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {error.explanation}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
          {feedback.improved ? (
            <AppText style={{ marginTop: spacing.md }}>
              <AppText variant="label">Gợi ý tự nhiên hơn: </AppText>
              {feedback.improved}
            </AppText>
          ) : null}
        </>
      ) : null}
      {attempt.referenceEn ? (
        <AppText
          variant="caption"
          tone="primary"
          style={{ marginTop: spacing.md }}
        >
          Bản tham khảo: {attempt.referenceEn}
        </AppText>
      ) : null}
      {attempt.notes ? (
        <AppText variant="caption" tone="muted">
          {attempt.notes}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  dot: {
    minWidth: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  dotDone: { backgroundColor: colors.successSoft, borderColor: colors.success },
  dotCurrent: { borderWidth: 2, borderColor: colors.accent },
  error: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
});
