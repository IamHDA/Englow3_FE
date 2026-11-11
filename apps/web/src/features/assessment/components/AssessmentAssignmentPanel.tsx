"use client";
import {
  Alert,
  Button,
  Group,
  Select,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useState } from "react";
import { useAuth } from "@/features/auth";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  useAssessmentAssignmentQuery,
  useAssignAssessmentMutation,
} from "@/lib/graphql/generated/hooks";

export function AssessmentAssignmentPanel({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const { session } = useAuth();
  const { isVi } = useLanguage();
  const admin = session?.role === "ADMIN";
  const query = useAssessmentAssignmentQuery({
    variables: { id },
    skip: !admin,
    fetchPolicy: "network-only",
  });
  const [assign, mutation] = useAssignAssessmentMutation();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!admin) return null;
  const data = query.data;
  if (!data)
    return query.error ? (
      <Alert color="orange">
        <Button
          variant="subtle"
          onClick={() => void query.refetch().catch(() => {})}
        >
          {isVi
            ? "Không tải được phân công. Thử lại"
            : "Assignment unavailable. Retry"}
        </Button>
      </Alert>
    ) : (
      <Skeleton height={100} />
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
      await query.refetch();
    } catch {
      setError(
        isVi
          ? "Không lưu được phân công. Tải lại bài nếu đã có người thay đổi hoặc chấm xong."
          : "Could not assign. Reload if this submission was changed or graded.",
      );
    }
  }
  return (
    <Stack gap="sm">
      <Text fw={600}>{isVi ? "Phân công chấm bài" : "Review assignment"}</Text>
      <Text size="sm">
        {assignment.reviewerName ??
          (isVi
            ? "Chưa phân công riêng; người phụ trách đề có thể chấm."
            : "No separate assignment; the task author can review.")}
      </Text>
      {assignable && (
        <>
          <Select
            label={isVi ? "Người chấm" : "Reviewer"}
            searchable
            clearable
            data={data.assessmentReviewers.map((r) => ({
              value: r.id,
              label: r.displayName,
            }))}
            value={selected}
            onChange={setSelected}
            disabled={mutation.loading}
          />
          <Textarea
            label={isVi ? "Lý do phân công" : "Assignment reason"}
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            maxLength={2000}
            disabled={mutation.loading}
          />
          <Group>
            <Button
              loading={mutation.loading}
              disabled={!selected || !note.trim()}
              onClick={() => void save(selected)}
            >
              {isVi ? "Giao chấm" : "Assign reviewer"}
            </Button>
            {assignment.reviewerId && (
              <Button
                variant="default"
                disabled={mutation.loading || !note.trim()}
                onClick={() => void save(null)}
              >
                {isVi ? "Gỡ phân công" : "Remove assignment"}
              </Button>
            )}
          </Group>
        </>
      )}
      {error && (
        <Alert color="orange" role="alert">
          {error}
        </Alert>
      )}
      {assignment.history.length > 0 && (
        <details>
          <summary>{isVi ? "Lịch sử phân công" : "Assignment history"}</summary>
          <Stack gap="xs" mt="sm">
            {assignment.history.map((e) => (
              <Text size="sm" key={e.id}>
                {new Date(e.createdAt).toLocaleString(isVi ? "vi-VN" : "en-GB")}{" "}
                · {e.note}
              </Text>
            ))}
          </Stack>
        </details>
      )}
    </Stack>
  );
}
