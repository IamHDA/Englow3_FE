import { Stack, router } from "expo-router";
import { useState } from "react";

import { skillLabel } from "@/features/assessment/report";
import { formatDateTime } from "@/features/shared/labels";
import {
  AssessmentAttemptStatus,
  useAssessmentReviewQueueQuery,
  useAssessmentWorkloadQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  ListItem,
  Pager,
  Row,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

export default function AdminAssessmentQueueScreen() {
  const [status, setStatus] = useState<AssessmentAttemptStatus>(
    AssessmentAttemptStatus.NEEDS_REVIEW,
  );
  const [page, setPage] = useState(0);
  const workload = useAssessmentWorkloadQuery({
    fetchPolicy: "cache-and-network",
  });
  const queue = useAssessmentReviewQueueQuery({
    variables: { status, oldest: true, page },
    fetchPolicy: "cache-and-network",
  });
  const counts = workload.data?.assessmentWorkload;

  return (
    <Screen
      refreshing={queue.loading && Boolean(queue.data)}
      onRefresh={() => {
        void queue.refetch();
        void workload.refetch();
      }}
    >
      <Stack.Screen options={{ title: "Chấm bài Nói & Viết" }} />
      {counts ? (
        <Card style={{ marginBottom: spacing.md }}>
          <Row wrap gap={spacing.lg}>
            <AppText>Chờ chấm: {counts.needsReview}</AppText>
            <AppText>Lỗi AI: {counts.failed}</AppText>
            <AppText>Đã chấm: {counts.completed}</AppText>
          </Row>
        </Card>
      ) : null}
      <ChipRow>
        {[
          [AssessmentAttemptStatus.NEEDS_REVIEW, "Chờ chấm"],
          [AssessmentAttemptStatus.FAILED, "AI lỗi"],
          [AssessmentAttemptStatus.COMPLETED, "Đã chấm"],
        ].map(([value, label]) => (
          <Chip
            key={value}
            label={label as string}
            selected={status === value}
            onPress={() => {
              setStatus(value as AssessmentAttemptStatus);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      <QueryView
        loading={queue.loading}
        error={queue.error}
        data={queue.data?.assessmentSubmissions}
        onRetry={() => void queue.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="checkmark-done-outline"
            title="Không còn bài nào trong hàng chờ"
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((item) => (
              <ListItem
                key={item.id}
                icon={
                  item.skill === "WRITING" ? "create-outline" : "mic-outline"
                }
                title={item.task.title}
                subtitle={`${skillLabel(item.skill)} · ${item.learnerName ?? "Học viên"} · ${formatDateTime(item.submittedAt)}`}
                onPress={() =>
                  router.push({
                    pathname: "/admin/assessments/submissions/[id]/grade",
                    params: { id: item.id },
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
