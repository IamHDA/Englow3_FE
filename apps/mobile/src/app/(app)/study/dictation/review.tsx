import { Stack, router } from "expo-router";
import { useState } from "react";

import { DictationExercise } from "@/features/dictation/DictationExercise";
import { useDictationMistakesQuery } from "@/lib/graphql/generated";
import { AppText, Button, EmptyState, Screen } from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

/** Every sentence the learner has not yet cleared, across lessons. */
export default function DictationReviewScreen() {
  const mistakes = useDictationMistakesQuery({ fetchPolicy: "network-only" });
  const [index, setIndex] = useState(0);

  return (
    <Screen>
      <Stack.Screen options={{ title: "Ôn câu chép sai" }} />
      <QueryView
        loading={mistakes.loading}
        error={mistakes.error}
        data={mistakes.data?.dictationMistakes}
        onRetry={() => void mistakes.refetch()}
        isEmpty={(items) => items.length === 0}
        empty={
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="Không còn câu nào cần ôn"
            message="Bạn đã chép đúng mọi câu đã luyện."
            action={<Button title="Quay lại" onPress={() => router.back()} />}
          />
        }
      >
        {(items) => {
          const item = items[index];
          if (!item) {
            return (
              <EmptyState
                icon="trophy-outline"
                title="Đã ôn hết lượt này"
                action={
                  <Button
                    title="Tải lại danh sách"
                    onPress={() => {
                      setIndex(0);
                      void mistakes.refetch();
                    }}
                  />
                }
              />
            );
          }
          return (
            <>
              <AppText tone="muted" style={{ marginBottom: spacing.sm }}>
                {index + 1}/{items.length} · {item.lessonTitle} · tốt nhất{" "}
                {item.bestAccuracyPercent}% sau {item.attemptCount} lần
              </AppText>
              <DictationExercise
                key={item.sentenceId}
                sentence={{
                  id: item.sentenceId,
                  audioUrl: item.audioUrl,
                  audioStartMs: item.audioStartMs,
                  audioEndMs: item.audioEndMs,
                }}
                onNext={() => setIndex(index + 1)}
              />
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
