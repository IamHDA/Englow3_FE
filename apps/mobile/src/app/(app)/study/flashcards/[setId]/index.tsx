import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import {
  FlashcardReviewStatus,
  useFlashcardSetDetailQuery,
} from "@/lib/graphql/generated";
import { useAudio, PlayButton } from "@/ui/audio";
import {
  AppText,
  Badge,
  Button,
  Card,
  Pager,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

const STATUS_LABELS: Partial<
  Record<
    FlashcardReviewStatus,
    { label: string; tone: "primary" | "accent" | "success" | "neutral" }
  >
> = {
  [FlashcardReviewStatus.NEW]: { label: "Mới", tone: "neutral" },
  [FlashcardReviewStatus.LEARNING]: { label: "Đang học", tone: "accent" },
  [FlashcardReviewStatus.REVIEW]: { label: "Ôn tập", tone: "primary" },
  [FlashcardReviewStatus.MASTERED]: { label: "Đã thuộc", tone: "success" },
};

export default function FlashcardSetScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const [page, setPage] = useState(0);
  const detail = useFlashcardSetDetailQuery({
    variables: { id: setId, page, size: 20 },
  });
  const audio = useAudio();

  return (
    <Screen
      refreshing={detail.loading && Boolean(detail.data)}
      onRefresh={() => void detail.refetch()}
    >
      <Stack.Screen
        options={{ title: detail.data?.flashcardSet.set.name ?? "Bộ thẻ" }}
      />
      <QueryView
        loading={detail.loading}
        error={detail.error}
        data={detail.data?.flashcardSet}
        onRetry={() => void detail.refetch()}
      >
        {(data) => (
          <>
            <Card style={{ marginBottom: spacing.lg }}>
              <AppText variant="heading">{data.set.name}</AppText>
              {data.set.description ? (
                <AppText tone="muted">{data.set.description}</AppText>
              ) : null}
              <AppText
                variant="caption"
                tone="muted"
                style={{ marginVertical: spacing.sm }}
              >
                {data.set.cardCount} thẻ · {data.set.masteredCount} đã thuộc ·{" "}
                {data.set.dueCount} đến hạn
              </AppText>
              <Button
                title={
                  data.set.dueCount > 0
                    ? `Ôn ${data.set.dueCount} thẻ đến hạn`
                    : "Học bộ thẻ này"
                }
                icon="play"
                onPress={() =>
                  router.push({
                    pathname: "/study/flashcards/[setId]/study",
                    params: { setId },
                  })
                }
              />
            </Card>

            <Section title="Danh sách thẻ">
              {data.cards.map((card) => {
                const status = STATUS_LABELS[card.status];
                return (
                  <Card key={card.id} style={{ marginBottom: spacing.sm }}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <View style={{ flex: 1 }}>
                        <AppText variant="label">
                          {card.lemma}{" "}
                          <AppText variant="caption" tone="muted">
                            {card.partOfSpeech}
                          </AppText>
                        </AppText>
                        <AppText variant="caption" tone="muted">
                          {[
                            card.ipaUs && `US ${card.ipaUs}`,
                            card.ipaUk && `UK ${card.ipaUk}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </AppText>
                      </View>
                      <PlayButton
                        url={card.audioUsUrl ?? card.audioUkUrl}
                        onPlay={(url) => void audio.play(url)}
                      />
                      {status ? (
                        <Badge label={status.label} tone={status.tone} />
                      ) : null}
                    </Row>
                    <AppText style={{ marginTop: spacing.xs }}>
                      {card.definitionVi}
                    </AppText>
                    {card.exampleSentence ? (
                      <AppText
                        variant="caption"
                        tone="muted"
                        style={{ fontStyle: "italic" }}
                      >
                        {card.exampleSentence}
                      </AppText>
                    ) : null}
                  </Card>
                );
              })}
              <Pager
                page={data.page}
                totalPages={data.totalPages}
                onChange={setPage}
              />
            </Section>
          </>
        )}
      </QueryView>
    </Screen>
  );
}
