import { Stack, router } from "expo-router";
import { useState } from "react";

import { formatDateTime } from "@/features/shared/labels";
import {
  ExamAttemptStatus,
  useExamAttemptHistoryQuery,
} from "@/lib/graphql/generated";
import { Badge, EmptyState, ListItem, Pager, Screen } from "@/ui/components";
import { QueryView } from "@/ui/QueryView";

export default function ExamHistoryScreen() {
  const [page, setPage] = useState(0);
  const history = useExamAttemptHistoryQuery({
    variables: { page, size: 20 },
    fetchPolicy: "cache-and-network",
  });

  return (
    <Screen
      refreshing={history.loading && Boolean(history.data)}
      onRefresh={() => void history.refetch()}
    >
      <Stack.Screen options={{ title: "Lịch sử làm đề" }} />
      <QueryView
        loading={history.loading}
        error={history.error}
        data={history.data?.examAttempts}
        onRetry={() => void history.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="document-text-outline"
            title="Bạn chưa làm đề nào"
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((attempt) => {
              const inProgress =
                attempt.status === ExamAttemptStatus.IN_PROGRESS;
              return (
                <ListItem
                  key={attempt.id}
                  icon={
                    inProgress ? "hourglass-outline" : "document-text-outline"
                  }
                  title={attempt.examTitle ?? "Đề thi"}
                  subtitle={`${attempt.mode === "PRACTICE" ? "Luyện tập" : "Thi thật"} · ${formatDateTime(attempt.submittedAt ?? attempt.startedAt)}`}
                  right={
                    inProgress ? (
                      <Badge label="Đang làm" tone="accent" />
                    ) : (
                      <Badge
                        label={
                          attempt.convertedScore != null
                            ? String(attempt.convertedScore)
                            : `${Math.round(attempt.scorePercentage ?? 0)}%`
                        }
                        tone="success"
                      />
                    )
                  }
                  onPress={() =>
                    router.push(
                      inProgress
                        ? {
                            pathname: "/exams/sitting/[attemptId]",
                            params: { attemptId: attempt.id },
                          }
                        : {
                            pathname: "/exams/result/[attemptId]",
                            params: { attemptId: attempt.id },
                          },
                    )
                  }
                />
              );
            })}
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
