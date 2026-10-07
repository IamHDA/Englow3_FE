"use client";
import {
  Alert,
  Button,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useAssessmentReviewsQuery } from "@/lib/graphql/generated/hooks";
import { useAssessmentText } from "../hooks/useAssessmentText";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { parseReport, criterionLabels } from "../types";

export function AssessmentAuditTrail({ id }: { id: string }) {
  const tx = useAssessmentText();
  const { isVi } = useLanguage();
  const query = useAssessmentReviewsQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });
  if (query.loading && !query.data) return <Skeleton height={160} />;
  if (query.error && !query.data)
    return (
      <Alert color="orange">
        <Stack>
          <Text>
            {isVi
              ? "Chưa tải được lịch sử kiểm duyệt."
              : "Could not load review history."}
          </Text>
          <Button
            variant="light"
            onClick={() => void query.refetch().catch(() => {})}
          >
            {isVi ? "Thử lại" : "Retry"}
          </Button>
        </Stack>
      </Alert>
    );
  if (!query.data?.assessmentReviews.length)
    return (
      <Text c="dimmed">
        {isVi ? "Chưa có lần chấm thủ công." : "No manual reviews yet."}
      </Text>
    );
  return (
    <Stack gap="sm">
      <Text fw={700}>
        {isVi ? "Lịch sử chấm và điều chỉnh" : "Grading and revision history"}
      </Text>
      <Text size="sm" c="dimmed">
        {isVi
          ? "Mới nhất ở trên. Kết quả hiện hành được hiển thị trong báo cáo."
          : "Newest first. The report shows the current result."}
      </Text>
      {query.data.assessmentReviews.map((review) => {
        const before = parseReport(review.previousReport),
          after = parseReport(review.report);
        return (
          <Card key={review.id}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600}>
                  {review.reviewerName ?? review.reviewerId.slice(0, 8)}
                </Text>
                <Text size="xs" c="dimmed">
                  {new Date(review.createdAt).toLocaleString(
                    isVi ? "vi-VN" : "en-GB",
                  )}
                </Text>
              </Group>
              <Text size="sm">{review.note}</Text>
              <Text fw={700}>
                {before?.overall.toFixed(1) ?? "—"} →{" "}
                {after?.overall.toFixed(1) ?? "—"} / 9
              </Text>
              {after?.criteria.map((c) => (
                <Text key={c.key} size="sm">
                  {tx(criterionLabels[c.key] ?? c.key)}:{" "}
                  {before?.criteria.find((old) => old.key === c.key)?.score ??
                    "—"}{" "}
                  → {c.score}
                </Text>
              ))}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
