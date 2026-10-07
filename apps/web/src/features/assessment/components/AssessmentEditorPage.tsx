"use client";
import { Container, Skeleton, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  useAssessmentAuthoringTaskDetailQuery,
  useAssessmentSubmissionDetailQuery,
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { AssessmentTaskEditor } from "./AssessmentTaskEditor";
import { AssessmentGradeEditor } from "./AssessmentGradeEditor";

export function AssessmentEditorPage({
  mode,
  id,
}: {
  mode: "new" | "edit" | "grade";
  id?: string;
}) {
  const router = useRouter();
  const task = useAssessmentAuthoringTaskDetailQuery({
    variables: { id: id ?? "" },
    skip: mode !== "edit",
    fetchPolicy: "network-only",
  });
  const submission = useAssessmentSubmissionDetailQuery({
    variables: { id: id ?? "" },
    skip: mode !== "grade",
    fetchPolicy: "network-only",
  });
  const back = () =>
    router.push(
      `/admin/assessments${mode === "grade" ? "?tab=submissions" : ""}`,
    );
  const query = mode === "grade" ? submission : task;
  if (mode !== "new" && query.loading && !query.data)
    return (
      <Container py="xl">
        <Stack>
          <Skeleton height={48} />
          <Skeleton height={480} />
        </Stack>
      </Container>
    );
  if (mode !== "new" && !query.data)
    return (
      <Container py="xl">
        <LoadErrorState
          error={query.error}
          thing={{ vi: "nội dung làm việc", en: "workspace content" }}
          back={{ href: "/admin/assessments", label: "Writing & Speaking" }}
          onRetry={() => void query.refetch().catch(() => {})}
        />
      </Container>
    );
  if (mode === "grade" && submission.data)
    return (
      <AssessmentGradeEditor
        key={`${id}:${submission.data.assessmentSubmission.version}`}
        standalone
        attempt={submission.data.assessmentSubmission}
        close={back}
        done={() => Promise.resolve()}
      />
    );
  return (
    <AssessmentTaskEditor
      key={id ?? "new"}
      standalone
      task={task.data?.authoringAssessmentTask ?? null}
      close={back}
      done={() => Promise.resolve()}
    />
  );
}
