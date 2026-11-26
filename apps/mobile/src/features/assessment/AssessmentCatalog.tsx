import { Stack, router } from "expo-router";
import { useState } from "react";

import {
  AssessmentSkill,
  useAssessmentCatalogQuery,
} from "@/lib/graphql/generated";
import { formatDuration } from "@/features/shared/labels";
import {
  Badge,
  Button,
  EmptyState,
  ListItem,
  Notice,
  Pager,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";

import { taskTypeLabel } from "./report";

export function AssessmentCatalog({ skill }: { skill: AssessmentSkill }) {
  const [page, setPage] = useState(0);
  const catalog = useAssessmentCatalogQuery({ variables: { skill, page } });
  const writing = skill === AssessmentSkill.WRITING;
  const capabilities = catalog.data?.assessmentCapabilities;
  const automatic = writing
    ? capabilities?.automaticWriting
    : capabilities?.automaticSpeaking;

  return (
    <Screen
      refreshing={catalog.loading && Boolean(catalog.data)}
      onRefresh={() => void catalog.refetch()}
    >
      <Stack.Screen options={{ title: writing ? "Luyện viết" : "Luyện nói" }} />
      {capabilities && !automatic ? (
        <Notice
          tone="info"
          message={
            capabilities.humanReview
              ? "AI chấm tự động đang tạm tắt. Bài nộp sẽ được giáo viên chấm."
              : "Chấm bài đang tạm dừng. Bạn vẫn có thể làm bài và nộp sau."
          }
        />
      ) : null}
      <Button
        title="Lịch sử bài làm"
        variant="ghost"
        icon="time-outline"
        onPress={() => router.push("/study/assessments")}
      />
      <QueryView
        loading={catalog.loading}
        error={catalog.error}
        data={catalog.data?.assessmentTasks}
        onRetry={() => void catalog.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon={writing ? "create-outline" : "mic-outline"}
            title="Chưa có đề nào"
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((task) => (
              <ListItem
                key={task.id}
                icon={writing ? "create-outline" : "mic-outline"}
                title={task.title}
                subtitle={[
                  taskTypeLabel(task.taskType),
                  formatDuration(task.timeLimitSeconds),
                  task.minimumWords > 0 ? `${task.minimumWords}+ từ` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                right={
                  task.targetLevel ? (
                    <Badge label={task.targetLevel} />
                  ) : undefined
                }
                onPress={() =>
                  router.push(
                    writing
                      ? {
                          pathname: "/study/writing/[id]",
                          params: { id: task.id },
                        }
                      : {
                          pathname: "/study/speaking/[id]",
                          params: { id: task.id },
                        },
                  )
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
