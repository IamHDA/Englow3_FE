import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { useTranslationSetsQuery } from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Card,
  EmptyState,
  Pager,
  ProgressBar,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, spacing } from "@/ui/theme";

export default function TranslationLibraryScreen() {
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

  const sets = useTranslationSetsQuery({
    variables: { title: title || null, page, size: 15 },
  });

  return (
    <Screen
      refreshing={sets.loading && Boolean(sets.data)}
      onRefresh={() => void sets.refetch()}
    >
      <Stack.Screen options={{ title: "Luyện dịch" }} />
      <TextField
        placeholder="Tìm bộ câu…"
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Tìm bộ câu dịch"
      />
      <QueryView
        loading={sets.loading}
        error={sets.error}
        data={sets.data?.translationSets}
        onRetry={() => void sets.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState icon="language-outline" title="Chưa có bộ câu dịch" />
        }
      >
        {(data) => (
          <>
            {data.items.map((set) => (
              <Card
                key={set.id}
                style={{ marginBottom: spacing.sm }}
                onPress={() =>
                  router.push({
                    pathname: "/study/translation/[id]",
                    params: { id: set.id },
                  })
                }
              >
                <Row style={{ justifyContent: "space-between" }}>
                  <AppText variant="label" style={{ flex: 1 }}>
                    {set.title}
                  </AppText>
                  {set.targetLevel ? <Badge label={set.targetLevel} /> : null}
                </Row>
                {set.description ? (
                  <AppText variant="caption" tone="muted" numberOfLines={2}>
                    {set.description}
                  </AppText>
                ) : null}
                <AppText
                  variant="caption"
                  tone="muted"
                  style={{ marginTop: spacing.xs }}
                >
                  {[
                    set.topic,
                    `${set.gradedCount}/${set.itemCount} câu đã chấm`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </AppText>
                <View style={{ marginTop: spacing.sm }}>
                  <ProgressBar
                    value={
                      set.itemCount > 0 ? set.gradedCount / set.itemCount : 0
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
          </>
        )}
      </QueryView>
    </Screen>
  );
}
