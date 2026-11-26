import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { formatDate, formatDuration } from "@/features/shared/labels";
import {
  useDictationLessonsQuery,
  useDictationStatsQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Card,
  EmptyState,
  ListItem,
  Pager,
  ProgressBar,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, spacing } from "@/ui/theme";

export default function DictationLibraryScreen() {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const lessons = useDictationLessonsQuery({
    variables: { title: title || null, page, size: 15 },
  });
  const stats = useDictationStatsQuery({ variables: { periodDays: 7 } });
  const summary = stats.data?.dictationStats;

  return (
    <Screen
      refreshing={lessons.loading && Boolean(lessons.data)}
      onRefresh={() => {
        void lessons.refetch();
        void stats.refetch();
      }}
    >
      <Stack.Screen options={{ title: "Nghe chép" }} />
      {summary ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <Row style={{ justifyContent: "space-around" }}>
            <Metric
              value={`${summary.averageAccuracyPercent}%`}
              label="chính xác"
            />
            <Metric value={summary.sentencesPractised} label="câu 7 ngày" />
            <Metric
              value={formatDuration(summary.listeningSeconds)}
              label="thời gian nghe"
            />
          </Row>
        </Card>
      ) : null}

      <ListItem
        icon="refresh-circle-outline"
        iconColor={colors.accent}
        title="Ôn lại câu chép sai"
        subtitle="Luyện riêng những câu bạn chưa chép đúng"
        onPress={() => router.push("/study/dictation/review")}
      />

      <TextField
        placeholder="Tìm bài nghe…"
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Tìm bài nghe"
      />

      <QueryView
        loading={lessons.loading}
        error={lessons.error}
        data={lessons.data?.dictationLessons}
        onRetry={() => void lessons.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState icon="headset-outline" title="Chưa có bài nghe chép" />
        }
      >
        {(data) => (
          <Section title={`${data.totalItems} bài`}>
            {data.items.map((lesson) => (
              <Card
                key={lesson.id}
                style={{ marginBottom: spacing.sm }}
                onPress={() =>
                  router.push({
                    pathname: "/study/dictation/[lessonId]",
                    params: { lessonId: lesson.id },
                  })
                }
              >
                <Row style={{ justifyContent: "space-between" }}>
                  <AppText variant="label" style={{ flex: 1 }}>
                    {lesson.title}
                  </AppText>
                  {lesson.targetLevel ? (
                    <Badge label={lesson.targetLevel} />
                  ) : null}
                </Row>
                <AppText variant="caption" tone="muted">
                  {[
                    lesson.topic,
                    `${lesson.sentenceCount} câu`,
                    formatDuration(lesson.totalDurationSeconds),
                    lesson.lastPractisedAt
                      ? `luyện ${formatDate(lesson.lastPractisedAt)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </AppText>
                <View style={{ marginTop: spacing.sm }}>
                  <ProgressBar
                    value={
                      lesson.sentenceCount > 0
                        ? lesson.completedSentenceCount / lesson.sentenceCount
                        : 0
                    }
                    color={colors.success}
                  />
                </View>
              </Card>
            ))}
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              onChange={setPage}
            />
          </Section>
        )}
      </QueryView>

      {summary && summary.missedWords.length > 0 ? (
        <Section title="Từ hay nghe sai">
          <Row wrap gap={spacing.xs}>
            {summary.missedWords.slice(0, 15).map((word) => (
              <Badge
                key={word.word}
                label={`${word.word} · ${word.accuracyPercent}%`}
                tone="danger"
              />
            ))}
          </Row>
        </Section>
      ) : null}
    </Screen>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </View>
  );
}
