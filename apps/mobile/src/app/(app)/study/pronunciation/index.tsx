import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";

import { useSpeakingPromptsQuery } from "@/lib/graphql/generated";
import {
  Badge,
  EmptyState,
  ListItem,
  Pager,
  Screen,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";

export default function PronunciationLibraryScreen() {
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

  const prompts = useSpeakingPromptsQuery({
    variables: { title: title || null, page, size: 20 },
  });

  return (
    <Screen
      refreshing={prompts.loading && Boolean(prompts.data)}
      onRefresh={() => void prompts.refetch()}
    >
      <Stack.Screen options={{ title: "Luyện phát âm" }} />
      <TextField
        placeholder="Tìm câu luyện…"
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Tìm câu luyện"
      />
      <QueryView
        loading={prompts.loading}
        error={prompts.error}
        data={prompts.data?.speakingPrompts}
        onRetry={() => void prompts.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState icon="mic-outline" title="Chưa có bài luyện phát âm" />
        }
      >
        {(data) => (
          <>
            {data.items.map((prompt) => (
              <ListItem
                key={prompt.id}
                icon="chatbubble-ellipses-outline"
                title={prompt.title}
                subtitle={[
                  prompt.referenceText,
                  prompt.category,
                  prompt.targetLevel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                right={
                  prompt.bestScorePercent != null ? (
                    <Badge
                      label={`${Math.round(prompt.bestScorePercent)}`}
                      tone={
                        prompt.bestScorePercent >= 80 ? "success" : "accent"
                      }
                    />
                  ) : undefined
                }
                onPress={() =>
                  router.push({
                    pathname: "/study/pronunciation/[lessonId]",
                    params: { lessonId: prompt.id },
                  })
                }
              />
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
