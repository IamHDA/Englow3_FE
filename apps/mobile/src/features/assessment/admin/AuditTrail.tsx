import { View } from "react-native";

import { formatDateTime } from "@/features/shared/labels";
import { useAssessmentReviewsQuery } from "@/lib/graphql/generated";
import { AppText, Card, ErrorState, LoadingState, Row } from "@/ui/components";
import { spacing } from "@/ui/theme";

import { CRITERION_LABELS, parseReport } from "../report";

/** Every manual grade and revision of a submission, newest first. As the web's AssessmentAuditTrail. */
export function AuditTrail({ id }: { id: string }) {
  const query = useAssessmentReviewsQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });
  if (query.loading && !query.data) return <LoadingState />;
  if (query.error && !query.data)
    return (
      <ErrorState
        message="Chưa tải được lịch sử kiểm duyệt."
        onRetry={() => void query.refetch().catch(() => undefined)}
      />
    );
  const reviews = query.data?.assessmentReviews ?? [];
  return (
    <View style={{ marginTop: spacing.lg }}>
      <AppText variant="label">Lịch sử chấm và điều chỉnh</AppText>
      {reviews.length === 0 ? (
        <AppText tone="muted">Chưa có lần chấm thủ công.</AppText>
      ) : (
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginBottom: spacing.sm }}
        >
          Mới nhất ở trên. Kết quả hiện hành được hiển thị trong báo cáo.
        </AppText>
      )}
      {reviews.map((review) => {
        const before = parseReport(review.previousReport);
        const after = parseReport(review.report);
        return (
          <Card key={review.id} style={{ marginBottom: spacing.sm }}>
            <Row style={{ justifyContent: "space-between" }}>
              <AppText variant="label">
                {review.reviewerName ?? review.reviewerId.slice(0, 8)}
              </AppText>
              <AppText variant="caption" tone="muted">
                {formatDateTime(review.createdAt)}
              </AppText>
            </Row>
            <AppText>{review.note}</AppText>
            <AppText variant="label" style={{ marginTop: spacing.xs }}>
              {before?.overall.toFixed(1) ?? "—"} →{" "}
              {after?.overall.toFixed(1) ?? "—"} / 9
            </AppText>
            {after?.criteria.map((criterion) => (
              <AppText key={criterion.key} variant="caption">
                {CRITERION_LABELS[criterion.key] ?? criterion.key}:{" "}
                {before?.criteria.find((old) => old.key === criterion.key)
                  ?.score ?? "—"}{" "}
                → {criterion.score}
              </AppText>
            ))}
          </Card>
        );
      })}
    </View>
  );
}
