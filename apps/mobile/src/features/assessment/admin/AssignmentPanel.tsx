import { useState } from "react";
import { View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { formatDateTime } from "@/features/shared/labels";
import {
  useAssessmentAssignmentQuery,
  useAssignAssessmentMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Button,
  Card,
  Chip,
  ChipRow,
  ErrorState,
  LoadingState,
  Notice,
  Row,
  TextField,
} from "@/ui/components";
import { spacing } from "@/ui/theme";

/**
 * Who grades a submission. Administrators only: hand it to a reviewer, or take
 * it back, with a reason each time. As the web's AssessmentAssignmentPanel.
 */
export function AssignmentPanel({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const { me } = useAuth();
  const admin = me?.role === "ADMIN";
  const query = useAssessmentAssignmentQuery({
    variables: { id },
    skip: !admin,
    fetchPolicy: "network-only",
  });
  const [assign, mutation] = useAssignAssessmentMutation();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  if (!admin) return null;
  const data = query.data;
  if (!data)
    return query.error ? (
      <ErrorState
        message="Không tải được phân công."
        onRetry={() => void query.refetch().catch(() => undefined)}
      />
    ) : (
      <LoadingState />
    );

  const assignment = data.assessmentAssignment;
  const assignable = status === "NEEDS_REVIEW" || status === "FAILED";

  async function save(reviewerId: string | null) {
    setError(null);
    try {
      await assign({
        variables: {
          id,
          reviewerId,
          version: assignment.version,
          note: note.trim(),
        },
      });
      setNote("");
      setSelected(null);
      await query.refetch();
    } catch {
      setError(
        "Không lưu được phân công. Tải lại bài nếu đã có người thay đổi hoặc chấm xong.",
      );
    }
  }

  return (
    <Card style={{ marginTop: spacing.md }}>
      <AppText variant="label">Phân công chấm bài</AppText>
      <AppText tone="muted" style={{ marginBottom: spacing.sm }}>
        {assignment.reviewerName ??
          "Chưa phân công riêng; người phụ trách đề có thể chấm."}
      </AppText>
      {assignable ? (
        <>
          <ChipRow>
            {data.assessmentReviewers.map((reviewer) => (
              <Chip
                key={reviewer.id}
                label={reviewer.displayName}
                selected={selected === reviewer.id}
                onPress={() =>
                  setSelected(selected === reviewer.id ? null : reviewer.id)
                }
              />
            ))}
          </ChipRow>
          <TextField
            label="Lý do phân công"
            value={note}
            onChangeText={setNote}
            maxLength={2000}
            multiline
            editable={!mutation.loading}
            style={{ minHeight: 70 }}
          />
          <Row wrap gap={spacing.xs}>
            <Button
              title="Giao chấm"
              size="sm"
              loading={mutation.loading}
              disabled={!selected || !note.trim()}
              onPress={() => void save(selected)}
            />
            {assignment.reviewerId ? (
              <Button
                title="Gỡ phân công"
                size="sm"
                variant="secondary"
                disabled={mutation.loading || !note.trim()}
                onPress={() => void save(null)}
              />
            ) : null}
          </Row>
        </>
      ) : null}
      <Notice message={error} />
      {assignment.history.length > 0 ? (
        <View style={{ marginTop: spacing.sm }}>
          <Button
            title={showHistory ? "Ẩn lịch sử phân công" : "Lịch sử phân công"}
            size="sm"
            variant="ghost"
            onPress={() => setShowHistory((value) => !value)}
          />
          {showHistory
            ? assignment.history.map((entry) => (
                <AppText key={entry.id} variant="caption" tone="muted">
                  {formatDateTime(entry.createdAt)} · {entry.note}
                </AppText>
              ))
            : null}
        </View>
      ) : null}
    </Card>
  );
}
