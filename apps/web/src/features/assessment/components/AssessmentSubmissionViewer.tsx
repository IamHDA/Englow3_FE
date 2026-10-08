"use client";
import { Alert, Button, Skeleton, Stack, Text } from "@mantine/core";
import { useAssessmentSubmissionDetailQuery } from "@/lib/graphql/generated/hooks";
import { AssessmentReport } from "./AssessmentReport";
import { AssessmentAuditTrail } from "./AssessmentAuditTrail";
import { TaskInstructions } from "./TaskInstructions";

export function AssessmentSubmissionViewer({ id }: { id: string }) {
  const query = useAssessmentSubmissionDetailQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });
  const attempt = query.data?.assessmentSubmission;
  if (!attempt)
    return query.error ? (
      <Alert color="orange">
        Chưa tải được bài.{" "}
        <Button
          variant="light"
          onClick={() => void query.refetch().catch(() => {})}
        >
          Thử lại
        </Button>
      </Alert>
    ) : (
      <Skeleton height={300} />
    );
  return (
    <Stack>
      <Text fw={700}>
        {attempt.learnerName ?? attempt.learnerId?.slice(0, 8)} ·{" "}
        {attempt.task.title}
      </Text>
      <TaskInstructions text={attempt.task.instructions} />
      {attempt.audioUrl && (
        <audio controls src={attempt.audioUrl} style={{ width: "100%" }} />
      )}
      {attempt.answerText && (
        <Text style={{ whiteSpace: "pre-wrap" }}>{attempt.answerText}</Text>
      )}
      {attempt.status === "COMPLETED" && <AssessmentReport attempt={attempt} />}
      <AssessmentAuditTrail id={id} />
    </Stack>
  );
}
