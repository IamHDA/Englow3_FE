import { Stack, router } from "expo-router";
import { useState } from "react";

import {
  ATTEMPT_STATUS_LABELS,
  parseReport,
  skillLabel,
} from "@/features/assessment/report";
import { formatDateTime } from "@/features/shared/labels";
import {
  AssessmentAttemptStatus,
  AssessmentSkill,
  useAssessmentHistoryQuery,
  useAssessmentNotificationsQuery,
} from "@/lib/graphql/generated";
import {
  Badge,
  Chip,
  ChipRow,
  EmptyState,
  ListItem,
  Pager,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors } from "@/ui/theme";

export default function AssessmentHistoryScreen() {
  const [skill, setSkill] = useState<AssessmentSkill | null>(null);
  const [page, setPage] = useState(0);
  const history = useAssessmentHistoryQuery({
    variables: { skill, page },
    fetchPolicy: "cache-and-network",
  });
  const notifications = useAssessmentNotificationsQuery({
    variables: { page: 0 },
    fetchPolicy: "cache-and-network",
  });
  const unread = notifications.data?.assessmentNotifications.items ?? [];

  return (
    <Screen
      refreshing={history.loading && Boolean(history.data)}
      onRefresh={() => {
        void history.refetch();
        void notifications.refetch();
      }}
    >
      <Stack.Screen options={{ title: "Bài Nói & Viết" }} />
      {unread.length > 0 ? (
        <Section title="Kết quả mới">
          {unread.map((item) => (
            <ListItem
              key={item.attemptId}
              icon="notifications"
              iconColor={colors.accent}
              title={item.title}
              subtitle={`${skillLabel(item.skill)} · chấm xong ${formatDateTime(item.assessedAt)}`}
              onPress={() =>
                router.push({
                  pathname: "/study/assessments/attempts/[id]",
                  params: { id: item.attemptId },
                })
              }
            />
          ))}
        </Section>
      ) : null}

      <ChipRow>
        <Chip
          label="Tất cả"
          selected={skill === null}
          onPress={() => {
            setSkill(null);
            setPage(0);
          }}
        />
        <Chip
          label="Viết"
          selected={skill === AssessmentSkill.WRITING}
          onPress={() => {
            setSkill(AssessmentSkill.WRITING);
            setPage(0);
          }}
        />
        <Chip
          label="Nói"
          selected={skill === AssessmentSkill.SPEAKING}
          onPress={() => {
            setSkill(AssessmentSkill.SPEAKING);
            setPage(0);
          }}
        />
      </ChipRow>

      <QueryView
        loading={history.loading}
        error={history.error}
        data={history.data?.assessmentHistory}
        onRetry={() => void history.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="document-text-outline"
            title="Bạn chưa làm bài nào"
            message="Chọn một đề trong Luyện viết hoặc Luyện nói."
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((attempt) => {
              const report = parseReport(attempt.report);
              return (
                <ListItem
                  key={attempt.id}
                  icon={
                    attempt.skill === AssessmentSkill.WRITING
                      ? "create-outline"
                      : "mic-outline"
                  }
                  title={attempt.task.title}
                  subtitle={`${ATTEMPT_STATUS_LABELS[attempt.status]} · ${formatDateTime(attempt.submittedAt ?? attempt.createdAt)}`}
                  right={
                    report ? (
                      <Badge label={report.overall.toFixed(1)} tone="success" />
                    ) : attempt.status === AssessmentAttemptStatus.FAILED ? (
                      <Badge label="Lỗi" tone="danger" />
                    ) : undefined
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/study/assessments/attempts/[id]",
                      params: { id: attempt.id },
                    })
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
