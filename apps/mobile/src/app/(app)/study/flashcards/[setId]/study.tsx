import { Stack, router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useStudySession } from "@/features/flashcard/useStudySession";
import {
  ReviewRating,
  useFlashcardSetSummaryQuery,
  useFlashcardStudyQueueQuery,
  useRateFlashcardMutation,
} from "@/lib/graphql/generated";
import { useAudio, PlayButton } from "@/ui/audio";
import {
  AppText,
  Button,
  EmptyState,
  Notice,
  ProgressBar,
  Row,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, radius, spacing } from "@/ui/theme";

/** Stable, so the session does not see a "new queue" on every render before data arrives. */
const NO_CARDS: never[] = [];

const RATINGS: {
  rating: ReviewRating;
  label: string;
  hint: string;
  color: string;
}[] = [
  {
    rating: ReviewRating.AGAIN,
    label: "Quên",
    hint: "Học lại",
    color: colors.danger,
  },
  {
    rating: ReviewRating.HARD,
    label: "Khó",
    hint: "Nhớ mang máng",
    color: colors.accent,
  },
  {
    rating: ReviewRating.GOOD,
    label: "Nhớ",
    hint: "Nghĩ một chút",
    color: colors.primary,
  },
  {
    rating: ReviewRating.EASY,
    label: "Dễ",
    hint: "Nhớ ngay",
    color: colors.success,
  },
];

export default function FlashcardStudyScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const queue = useFlashcardStudyQueueQuery({
    variables: { setId },
    fetchPolicy: "network-only",
  });
  const summary = useFlashcardSetSummaryQuery({ variables: { id: setId } });
  const [rateFlashcard] = useRateFlashcardMutation();
  const audio = useAudio();

  const rate = useCallback(
    (flashcardId: string, rating: ReviewRating, timeSpentSeconds: number) =>
      rateFlashcard({ variables: { flashcardId, rating, timeSpentSeconds } }),
    [rateFlashcard],
  );
  const session = useStudySession(
    queue.data?.flashcardStudyQueue ?? NO_CARDS,
    rate,
  );
  const title = summary.data?.flashcardSetSummary.name ?? "Học thẻ";

  return (
    <Screen scroll>
      <Stack.Screen options={{ title }} />
      <QueryView
        loading={queue.loading}
        error={queue.error}
        data={queue.data?.flashcardStudyQueue}
        onRetry={() => void queue.refetch()}
        isEmpty={(cards) => cards.length === 0}
        empty={
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="Không còn thẻ nào cần ôn"
            message="Bạn đã ôn hết thẻ đến hạn của bộ này. Quay lại sau nhé!"
            action={<Button title="Về bộ thẻ" onPress={() => router.back()} />}
          />
        }
      >
        {() =>
          session.done ? (
            <EmptyState
              icon="trophy-outline"
              title="Hoàn thành phiên học!"
              message={`Đã ôn ${session.total} thẻ · nhớ ${session.accuracy}% · Quên ${session.counts.again}, Khó ${session.counts.hard}, Nhớ ${session.counts.good}, Dễ ${session.counts.easy}`}
              action={
                <View style={{ gap: spacing.sm, alignSelf: "stretch" }}>
                  <Button
                    title="Ôn tiếp"
                    onPress={() => {
                      void queue.refetch();
                    }}
                  />
                  <Button
                    title="Xong"
                    variant="secondary"
                    onPress={() => router.back()}
                  />
                </View>
              }
            />
          ) : session.card ? (
            <>
              <Row style={{ marginBottom: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={session.index / session.total} />
                </View>
                <AppText variant="caption" tone="muted">
                  {session.index + 1}/{session.total}
                </AppText>
              </Row>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  session.flipped ? "Xem mặt trước" : "Lật thẻ"
                }
                onPress={() => {
                  session.flip();
                  void Haptics.selectionAsync();
                }}
                style={styles.card}
              >
                <AppText variant="title" style={styles.center}>
                  {session.card.lemma}
                </AppText>
                <AppText tone="muted" style={styles.center}>
                  {[
                    session.card.partOfSpeech,
                    session.card.ipaUs ?? session.card.ipaUk,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </AppText>
                <Row
                  style={{ justifyContent: "center", marginTop: spacing.sm }}
                  gap={spacing.lg}
                >
                  <PlayButton
                    url={session.card.audioUsUrl}
                    label="US"
                    onPlay={(url) => void audio.play(url)}
                  />
                  <PlayButton
                    url={session.card.audioUkUrl}
                    label="UK"
                    onPlay={(url) => void audio.play(url)}
                  />
                </Row>

                {session.flipped ? (
                  <View style={styles.back}>
                    <AppText variant="heading" style={styles.center}>
                      {session.card.definitionVi}
                    </AppText>
                    <AppText tone="muted" style={styles.center}>
                      {session.card.definitionEn}
                    </AppText>
                    {session.card.exampleSentence ? (
                      <View style={styles.example}>
                        <AppText style={{ fontStyle: "italic" }}>
                          {session.card.exampleSentence}
                        </AppText>
                        {session.card.exampleTranslationVi ? (
                          <AppText variant="caption" tone="muted">
                            {session.card.exampleTranslationVi}
                          </AppText>
                        ) : null}
                      </View>
                    ) : null}
                    {session.card.mnemonicTipVi ? (
                      <AppText
                        variant="caption"
                        tone="primary"
                        style={styles.center}
                      >
                        💡 {session.card.mnemonicTipVi}
                      </AppText>
                    ) : null}
                  </View>
                ) : (
                  <AppText
                    variant="caption"
                    tone="faint"
                    style={[styles.center, { marginTop: spacing.xl }]}
                  >
                    Chạm để lật thẻ
                  </AppText>
                )}
              </Pressable>

              <Notice
                message={
                  session.saveError
                    ? "Chưa lưu được đánh giá. Kiểm tra mạng rồi chọn lại."
                    : null
                }
              />

              {session.flipped ? (
                <Row gap={spacing.sm}>
                  {RATINGS.map((item) => (
                    <Pressable
                      key={item.rating}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.label}: ${item.hint}`}
                      disabled={session.saving}
                      onPress={() => void session.submit(item.rating)}
                      style={[
                        styles.rating,
                        { borderColor: item.color },
                        session.saving && { opacity: 0.5 },
                      ]}
                    >
                      <AppText variant="label" style={{ color: item.color }}>
                        {item.label}
                      </AppText>
                      <AppText
                        variant="caption"
                        tone="muted"
                        style={styles.center}
                      >
                        {item.hint}
                      </AppText>
                    </Pressable>
                  ))}
                </Row>
              ) : (
                <Button title="Lật thẻ" onPress={session.flip} />
              )}
            </>
          ) : null
        }
      </QueryView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  card: {
    minHeight: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  back: { marginTop: spacing.xl, gap: spacing.sm },
  example: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rating: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
});
