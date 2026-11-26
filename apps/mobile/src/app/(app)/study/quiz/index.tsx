import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";

import { useQuizzesQuery } from "@/lib/graphql/generated";
import { formatDuration } from "@/features/shared/labels";
import {
  Badge,
  EmptyState,
  ListItem,
  Pager,
  Screen,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";

export default function QuizCatalogueScreen() {
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

  const quizzes = useQuizzesQuery({
    variables: { title: title || null, page, size: 15 },
  });

  return (
    <Screen
      refreshing={quizzes.loading && Boolean(quizzes.data)}
      onRefresh={() => void quizzes.refetch()}
    >
      <Stack.Screen options={{ title: "Trắc nghiệm" }} />
      <TextField
        placeholder="Tìm bài trắc nghiệm…"
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Tìm bài trắc nghiệm"
      />
      <QueryView
        loading={quizzes.loading}
        error={quizzes.error}
        data={quizzes.data?.quizzes}
        onRetry={() => void quizzes.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState icon="checkbox-outline" title="Chưa có bài trắc nghiệm" />
        }
      >
        {(data) => (
          <>
            {data.items.map((quiz) => (
              <ListItem
                key={quiz.id}
                icon="checkbox-outline"
                title={quiz.title}
                subtitle={[
                  `${quiz.questionCount} câu`,
                  quiz.timeLimitSeconds
                    ? formatDuration(quiz.timeLimitSeconds)
                    : null,
                  quiz.targetLevel,
                  quiz.bestScorePercent != null
                    ? `Cao nhất ${Math.round(quiz.bestScorePercent)}%`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                right={
                  quiz.bestScorePercent != null &&
                  quiz.bestScorePercent >= quiz.passingScorePercent ? (
                    <Badge label="Đạt" tone="success" />
                  ) : undefined
                }
                onPress={() =>
                  router.push({
                    pathname: "/study/quiz/[quizId]",
                    params: { quizId: quiz.id, title: quiz.title },
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
