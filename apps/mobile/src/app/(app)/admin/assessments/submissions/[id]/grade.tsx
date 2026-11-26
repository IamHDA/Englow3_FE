import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AssignmentPanel } from "@/features/assessment/admin/AssignmentPanel";
import { AuditTrail } from "@/features/assessment/admin/AuditTrail";
import {
  CRITERION_LABELS,
  parseReport,
  skillLabel,
} from "@/features/assessment/report";
import { errorMessage } from "@/lib/errors";
import {
  useAssessmentGradeMutation,
  useAssessmentSubmissionDetailQuery,
  type AssessmentAttemptFieldsFragment,
} from "@/lib/graphql/generated";
import { PlayButton } from "@/ui/audio";
import {
  AppText,
  Badge,
  Button,
  Card,
  Notice,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

const WRITING = [
  "TASK_RESPONSE",
  "COHERENCE_COHESION",
  "LEXICAL_RESOURCE",
  "GRAMMATICAL_RANGE",
];
const SPEAKING = [
  "FLUENCY_COHERENCE",
  "LEXICAL_RESOURCE",
  "GRAMMATICAL_RANGE",
  "PRONUNCIATION",
];

const bandOk = (value: string) => {
  const number = Number(value);
  return (
    value.trim() !== "" &&
    Number.isFinite(number) &&
    number >= 0 &&
    number <= 9 &&
    Math.round(number * 2) === number * 2
  );
};

/** A teacher's grade: a band and feedback per criterion, written as the same report the AI writes. */
export default function GradeSubmissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useAssessmentSubmissionDetailQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });

  return (
    <Screen>
      <Stack.Screen options={{ title: "Chấm bài" }} />
      <QueryView
        loading={detail.loading}
        error={detail.error}
        data={detail.data?.assessmentSubmission}
        onRetry={() => void detail.refetch()}
      >
        {(attempt) => (
          <>
            <GradeForm
              key={`${attempt.id}-${attempt.version}`}
              attempt={attempt}
            />
            <AssignmentPanel id={attempt.id} status={attempt.status} />
            <AuditTrail id={attempt.id} />
          </>
        )}
      </QueryView>
    </Screen>
  );
}

function GradeForm({ attempt }: { attempt: AssessmentAttemptFieldsFragment }) {
  const [grade, gradeState] = useAssessmentGradeMutation();
  const keys = attempt.skill === "WRITING" ? WRITING : SPEAKING;
  // Start from the AI's report when there is one.
  const [initial] = useState(() => parseReport(attempt.report));
  const [scores, setScores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (initial?.criteria ?? []).map((c) => [c.key, c.score?.toString() ?? ""]),
    ),
  );
  const [feedback, setFeedback] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (initial?.criteria ?? []).map((c) => [c.key, c.feedback]),
    ),
  );
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [strengths, setStrengths] = useState(
    initial?.strengths.join("\n") ?? "",
  );
  const [improvements, setImprovements] = useState(
    initial?.improvements.join("\n") ?? "",
  );
  const [transcript, setTranscript] = useState(attempt.recognizedText ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!keys.every((key) => bandOk(scores[key] ?? "")))
      return setError("Mỗi tiêu chí cần band từ 0 đến 9, bước 0,5.");
    if (!keys.every((key) => (feedback[key] ?? "").trim()))
      return setError("Mỗi tiêu chí cần nhận xét.");
    if (!summary.trim()) return setError("Hãy viết nhận xét chung.");
    if (!note.trim()) return setError("Hãy ghi lý do chấm (ghi chú nội bộ).");
    const bands = keys.map((key) => Number(scores[key]));
    const overall =
      Math.round(
        (bands.reduce((sum, band) => sum + band, 0) / bands.length) * 2,
      ) / 2;
    // The backend takes at most ten of each and recomputes the overall band itself.
    const lines = (value: string) =>
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 10);
    const report = {
      overall,
      criteria: keys.map((key) => ({
        key,
        score: Number(scores[key]),
        feedback: (feedback[key] ?? "").trim(),
      })),
      summary: summary.trim(),
      strengths: lines(strengths),
      improvements: lines(improvements),
      estimated: true,
    };
    setError(null);
    try {
      await grade({
        variables: {
          id: attempt.id,
          report: JSON.stringify(report),
          note: note.trim(),
          transcript:
            attempt.skill === "SPEAKING" ? transcript.trim() || null : null,
          version: attempt.version,
        },
      });
      router.back();
    } catch (failure) {
      setError(
        errorMessage(failure, {
          CONFLICT: "Bài vừa được người khác chấm. Hãy tải lại.",
        }),
      );
    }
  }

  return (
    <>
      <Row gap={spacing.sm} style={{ marginBottom: spacing.sm }}>
        <Badge label={skillLabel(attempt.skill)} />
        <AppText tone="muted">{attempt.learnerName ?? "Học viên"}</AppText>
      </Row>
      <Card style={{ marginBottom: spacing.md }}>
        <AppText variant="label">{attempt.task.title}</AppText>
        <AppText tone="muted" selectable>
          {attempt.task.instructions}
        </AppText>
        {attempt.task.rubricNotes ? (
          <AppText
            variant="caption"
            tone="primary"
            style={{ marginTop: spacing.xs }}
          >
            Hướng dẫn chấm: {attempt.task.rubricNotes}
          </AppText>
        ) : null}
      </Card>
      <Section title="Bài làm">
        {attempt.audioUrl ? (
          <PlayButton url={attempt.audioUrl} label="Nghe bản ghi" />
        ) : null}
        {attempt.answerText ? (
          <AppText selectable>{attempt.answerText}</AppText>
        ) : null}
        {attempt.skill === "SPEAKING" ? (
          <TextField
            label="Bản ghi lời (transcript)"
            value={transcript}
            onChangeText={setTranscript}
            multiline
          />
        ) : null}
      </Section>
      <Section title="Chấm theo tiêu chí">
        {keys.map((key) => (
          <View key={key} style={{ marginBottom: spacing.sm }}>
            <AppText variant="label">{CRITERION_LABELS[key]}</AppText>
            <TextField
              placeholder="Band 0-9"
              value={scores[key] ?? ""}
              onChangeText={(value) =>
                setScores((current) => ({ ...current, [key]: value }))
              }
              keyboardType="decimal-pad"
            />
            <TextField
              placeholder="Nhận xét"
              value={feedback[key] ?? ""}
              onChangeText={(value) =>
                setFeedback((current) => ({ ...current, [key]: value }))
              }
              multiline
            />
          </View>
        ))}
      </Section>
      <TextField
        label="Nhận xét chung"
        value={summary}
        onChangeText={setSummary}
        multiline
      />
      <TextField
        label="Điểm mạnh (mỗi dòng một ý)"
        value={strengths}
        onChangeText={setStrengths}
        multiline
      />
      <TextField
        label="Cần cải thiện (mỗi dòng một ý)"
        value={improvements}
        onChangeText={setImprovements}
        multiline
      />
      <TextField
        label="Ghi chú nội bộ (lý do chấm)"
        value={note}
        onChangeText={setNote}
        multiline
      />
      <Notice message={error} />
      <Button
        title="Lưu điểm"
        loading={gradeState.loading}
        onPress={() => void submit()}
      />
    </>
  );
}
