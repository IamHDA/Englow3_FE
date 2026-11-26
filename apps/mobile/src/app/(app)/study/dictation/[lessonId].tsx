import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DictationExercise } from "@/features/dictation/DictationExercise";
import { useDictationLessonDetailQuery } from "@/lib/graphql/generated";
import {
  AppText,
  Button,
  EmptyState,
  ProgressBar,
  Row,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, radius, spacing } from "@/ui/theme";

export default function DictationPracticeScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const detail = useDictationLessonDetailQuery({
    variables: { id: lessonId },
    fetchPolicy: "cache-and-network",
  });
  const [index, setIndex] = useState<number | null>(null);
  const [cleared, setCleared] = useState<Set<string>>(new Set());

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: detail.data?.dictationLesson.lesson.title ?? "Nghe chép",
        }}
      />
      <QueryView
        loading={detail.loading}
        error={detail.error}
        data={detail.data?.dictationLesson}
        onRetry={() => void detail.refetch()}
        isEmpty={(data) => data.sentences.length === 0}
        empty={<EmptyState title="Bài này chưa có câu nào" />}
      >
        {(data) => {
          const sentences = [...data.sentences].sort(
            (a, b) => a.orderNo - b.orderNo,
          );
          // Open at the first sentence not yet cleared, as a learner coming back expects.
          const firstOpen = Math.max(
            0,
            sentences.findIndex(
              (sentence) =>
                (sentence.bestAccuracyPercent ?? 0) < 100 &&
                !cleared.has(sentence.id),
            ),
          );
          const current = index ?? firstOpen;
          const sentence = sentences[current];
          const done = sentences.filter(
            (item) =>
              cleared.has(item.id) || (item.bestAccuracyPercent ?? 0) >= 100,
          ).length;

          if (current >= sentences.length || !sentence) {
            return (
              <EmptyState
                icon="trophy-outline"
                title="Hoàn thành bài nghe!"
                message={`Bạn đã đi hết ${sentences.length} câu.`}
                action={
                  <Button title="Về thư viện" onPress={() => router.back()} />
                }
              />
            );
          }

          return (
            <>
              <Row style={{ marginBottom: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <ProgressBar
                    value={done / sentences.length}
                    color={colors.success}
                  />
                </View>
                <AppText variant="caption" tone="muted">
                  Câu {current + 1}/{sentences.length}
                </AppText>
              </Row>
              <Row wrap gap={spacing.xs} style={{ marginBottom: spacing.md }}>
                {sentences.map((item, position) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Câu ${position + 1}`}
                    onPress={() => setIndex(position)}
                    style={[
                      styles.dot,
                      (cleared.has(item.id) ||
                        (item.bestAccuracyPercent ?? 0) >= 100) &&
                        styles.dotDone,
                      position === current && styles.dotCurrent,
                    ]}
                  >
                    <AppText variant="caption">{position + 1}</AppText>
                  </Pressable>
                ))}
              </Row>
              <DictationExercise
                key={sentence.id}
                sentence={sentence}
                onChecked={(result) => {
                  if (result.cleared)
                    setCleared((value) => new Set(value).add(sentence.id));
                }}
                onNext={() => setIndex(current + 1)}
                nextLabel={
                  current + 1 >= sentences.length ? "Hoàn thành" : "Câu tiếp"
                }
              />
            </>
          );
        }}
      </QueryView>
    </Screen>
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
});
