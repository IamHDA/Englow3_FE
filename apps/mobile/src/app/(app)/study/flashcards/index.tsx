import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { formatDate } from "@/features/shared/labels";
import {
  useFlashcardSetsQuery,
  useFlashcardStatsQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Pager,
  ProgressBar,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, spacing } from "@/ui/theme";

const PAGE_SIZE = 12;

export default function FlashcardCatalogueScreen() {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Search as the learner pauses typing, not on every key.
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const sets = useFlashcardSetsQuery({
    variables: { topic, title: title || null, page, size: PAGE_SIZE },
  });
  const stats = useFlashcardStatsQuery({ variables: { periodDays: 7 } });
  const info = sets.data?.flashcardCatalogueInfo;

  return (
    <Screen
      refreshing={sets.loading && Boolean(sets.data)}
      onRefresh={() => {
        void sets.refetch();
        void stats.refetch();
      }}
    >
      <Stack.Screen options={{ title: "Thẻ từ vựng" }} />

      {stats.data ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <Row style={{ justifyContent: "space-around" }}>
            <Metric value={info?.totalDueCount ?? 0} label="thẻ đến hạn" />
            <Metric
              value={stats.data.flashcardStats.cardsStudied}
              label="thẻ 7 ngày"
            />
            <Metric
              value={`${stats.data.flashcardStats.retentionPercent}%`}
              label="nhớ được"
            />
            <Metric
              value={stats.data.flashcardStats.streakDays}
              label="ngày liên tiếp"
            />
          </Row>
        </Card>
      ) : null}

      <TextField
        placeholder="Tìm bộ thẻ…"
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        accessibilityLabel="Tìm bộ thẻ"
      />
      {info && info.topics.length > 0 ? (
        <ChipRow>
          <Chip
            label="Tất cả"
            selected={topic === null}
            onPress={() => {
              setTopic(null);
              setPage(0);
            }}
          />
          {info.topics.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={topic === item}
              onPress={() => {
                setTopic(item);
                setPage(0);
              }}
            />
          ))}
        </ChipRow>
      ) : null}

      <QueryView
        loading={sets.loading}
        error={sets.error}
        data={sets.data?.flashcardSets}
        onRetry={() => void sets.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="albums-outline"
            title="Không có bộ thẻ nào"
            message="Thử từ khoá hoặc chủ đề khác."
          />
        }
      >
        {(data) => (
          <Section title={`${data.totalItems} bộ thẻ`}>
            {data.items.map((set) => (
              <Card
                key={set.id}
                style={{ marginBottom: spacing.sm }}
                onPress={() =>
                  router.push({
                    pathname: "/study/flashcards/[setId]",
                    params: { setId: set.id },
                  })
                }
              >
                <Row
                  style={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <AppText variant="label">{set.name}</AppText>
                    {set.description ? (
                      <AppText variant="caption" tone="muted" numberOfLines={2}>
                        {set.description}
                      </AppText>
                    ) : null}
                  </View>
                  {set.dueCount > 0 ? (
                    <Badge label={`${set.dueCount} đến hạn`} tone="accent" />
                  ) : null}
                </Row>
                <Row style={{ marginTop: spacing.sm }} gap={spacing.sm} wrap>
                  {set.topic ? (
                    <Badge label={set.topic} tone="neutral" />
                  ) : null}
                  {set.targetLevel ? <Badge label={set.targetLevel} /> : null}
                  <AppText variant="caption" tone="muted">
                    {set.masteredCount}/{set.cardCount} thẻ đã thuộc
                    {set.lastStudiedAt
                      ? ` · học ${formatDate(set.lastStudiedAt)}`
                      : ""}
                  </AppText>
                </Row>
                <View style={{ marginTop: spacing.sm }}>
                  <ProgressBar
                    value={
                      set.cardCount > 0 ? set.masteredCount / set.cardCount : 0
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

      {stats.data && stats.data.flashcardStats.difficultCards.length > 0 ? (
        <Section title="Từ hay quên">
          {stats.data.flashcardStats.difficultCards.slice(0, 8).map((card) => (
            <Row key={card.flashcardId} style={{ marginBottom: spacing.xs }}>
              <AppText variant="label" style={{ flex: 1 }}>
                {card.lemma}
              </AppText>
              <AppText variant="caption" tone="muted">
                {card.setName} · quên {card.lapseCount} lần
              </AppText>
            </Row>
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}
