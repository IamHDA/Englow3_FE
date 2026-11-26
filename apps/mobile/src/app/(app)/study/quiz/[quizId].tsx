import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import {
  encodeAnswer,
  isAnswered,
  type QuizAnswer,
} from "@/features/quiz/answerEncoding";
import { QuestionView } from "@/features/quiz/QuestionView";
import { formatDuration } from "@/features/shared/labels";
import { useCountdown } from "@/features/shared/useCountdown";
import { errorMessage } from "@/lib/errors";
import {
  useQuizPaperQuery,
  useStartQuizAttemptMutation,
  useSubmitQuizAttemptMutation,
  type SubmitQuizAttemptMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Notice,
  ProgressBar,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, radius, spacing } from "@/ui/theme";

type Scored = SubmitQuizAttemptMutation["submitQuizAttempt"];

const QUIZ_ERRORS: Record<string, string> = {
  QUIZ_NOT_FOUND: "Không tìm thấy bài trắc nghiệm này.",
  QUIZ_ATTEMPT_EXPIRED: "Đã hết giờ làm bài.",
};

export default function QuizSittingScreen() {
  const { quizId, title } = useLocalSearchParams<{
    quizId: string;
    title?: string;
  }>();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startQuiz, startState] = useStartQuizAttemptMutation();
  const [scored, setScored] = useState<Scored | null>(null);

  async function begin() {
    setScored(null);
    try {
      const { data } = await startQuiz({ variables: { quizId } });
      if (data) setAttemptId(data.startQuizAttempt.id);
    } catch {
      // startState.error renders below
    }
  }

  if (scored) {
    return (
      <QuizResult
        scored={scored}
        onRetake={() => void begin()}
        retaking={startState.loading}
      />
    );
  }

  if (!attemptId) {
    return (
      <Screen>
        <Stack.Screen options={{ title: title ?? "Trắc nghiệm" }} />
        <Card>
          <Ionicons name="checkbox-outline" size={36} color={colors.primary} />
          <AppText variant="heading" style={{ marginTop: spacing.sm }}>
            {title ?? "Bài trắc nghiệm"}
          </AppText>
          <AppText tone="muted" style={{ marginVertical: spacing.md }}>
            Đồng hồ bắt đầu chạy khi bạn bấm Bắt đầu. Hết giờ, bài sẽ tự nộp.
            Nếu bạn còn một lượt làm dở, Englow3 sẽ mở lại lượt đó.
          </AppText>
          <Notice
            message={
              startState.error
                ? errorMessage(startState.error, QUIZ_ERRORS)
                : null
            }
          />
          <Button
            title="Bắt đầu"
            icon="play"
            loading={startState.loading}
            onPress={() => void begin()}
          />
        </Card>
      </Screen>
    );
  }

  return <QuizSitting attemptId={attemptId} onScored={setScored} />;
}

function QuizSitting({
  attemptId,
  onScored,
}: {
  attemptId: string;
  onScored: (scored: Scored) => void;
}) {
  const paperQuery = useQuizPaperQuery({
    variables: { attemptId },
    fetchPolicy: "network-only",
  });
  const [submit, submitState] = useSubmitQuizAttemptMutation();
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [current, setCurrent] = useState(0);
  const [sendFailed, setSendFailed] = useState(false);
  const pending = useRef(false);
  const paper = paperQuery.data?.quizPaper;

  async function send() {
    if (!paper || pending.current) return;
    pending.current = true;
    setSendFailed(false);
    try {
      // Every question goes out, answered or not: a missing answer is wrong, not absent.
      const payload = paper.questions.map((question) => ({
        questionId: question.id,
        response: encodeAnswer(question, answers[question.id]),
      }));
      const { data } = await submit({
        variables: { attemptId, answers: payload },
      });
      if (data) onScored(data.submitQuizAttempt);
      else setSendFailed(true);
    } catch {
      setSendFailed(true);
    } finally {
      pending.current = false;
    }
  }

  const secondsLeft = useCountdown(paper?.expiresAt, () => void send());

  function confirmSubmit() {
    if (!paper) return;
    const unanswered = paper.questions.filter(
      (question) => !isAnswered(question, answers[question.id]),
    ).length;
    Alert.alert(
      "Nộp bài?",
      unanswered > 0
        ? `Bạn còn ${unanswered} câu chưa trả lời.`
        : "Bạn đã trả lời tất cả các câu.",
      [
        { text: "Làm tiếp", style: "cancel" },
        { text: "Nộp bài", onPress: () => void send() },
      ],
    );
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: paper?.title ?? "Trắc nghiệm",
          headerRight: () =>
            secondsLeft != null ? (
              <Badge
                label={`⏱ ${formatDuration(secondsLeft)}`}
                tone={secondsLeft < 60 ? "danger" : "primary"}
              />
            ) : null,
        }}
      />
      <QueryView
        loading={paperQuery.loading}
        error={paperQuery.error}
        data={paper}
        onRetry={() => void paperQuery.refetch()}
      >
        {(data) => {
          const questions = [...data.questions].sort(
            (a, b) => a.orderNo - b.orderNo,
          );
          const question = questions[current];
          const answeredCount = questions.filter((item) =>
            isAnswered(item, answers[item.id]),
          ).length;
          if (!question) return null;
          return (
            <>
              <Row style={{ marginBottom: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={answeredCount / questions.length} />
                </View>
                <AppText variant="caption" tone="muted">
                  {answeredCount}/{questions.length} đã trả lời
                </AppText>
              </Row>

              <Row wrap gap={spacing.xs} style={{ marginBottom: spacing.lg }}>
                {questions.map((item, index) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Câu ${index + 1}`}
                    onPress={() => setCurrent(index)}
                    style={[
                      styles.dot,
                      isAnswered(item, answers[item.id]) && styles.dotDone,
                      index === current && styles.dotCurrent,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      tone={
                        isAnswered(item, answers[item.id]) ? "inverse" : "muted"
                      }
                    >
                      {index + 1}
                    </AppText>
                  </Pressable>
                ))}
              </Row>

              <Card>
                <AppText
                  variant="caption"
                  tone="primary"
                  style={{ marginBottom: spacing.xs }}
                >
                  Câu {current + 1} · {question.points} điểm
                </AppText>
                <QuestionView
                  question={question}
                  answer={answers[question.id]}
                  onChange={(answer) =>
                    setAnswers((value) => ({ ...value, [question.id]: answer }))
                  }
                  disabled={submitState.loading}
                />
              </Card>

              <Notice
                message={
                  sendFailed
                    ? secondsLeft === 0
                      ? "Hết giờ nhưng chưa gửi được bài. Kiểm tra mạng rồi bấm Gửi lại."
                      : "Chưa gửi được bài. Kiểm tra mạng rồi thử lại."
                    : null
                }
              />

              <Row gap={spacing.sm} style={{ marginTop: spacing.lg }}>
                <Button
                  title="Câu trước"
                  variant="secondary"
                  disabled={current === 0}
                  onPress={() => setCurrent((value) => value - 1)}
                  style={{ flex: 1 }}
                />
                {current < questions.length - 1 ? (
                  <Button
                    title="Câu sau"
                    onPress={() => setCurrent((value) => value + 1)}
                    style={{ flex: 1 }}
                  />
                ) : (
                  <Button
                    title={
                      sendFailed && secondsLeft === 0 ? "Gửi lại" : "Nộp bài"
                    }
                    variant="accent"
                    loading={submitState.loading}
                    onPress={
                      secondsLeft === 0 ? () => void send() : confirmSubmit
                    }
                    style={{ flex: 1 }}
                  />
                )}
              </Row>
              {current < questions.length - 1 ? (
                <Button
                  title="Nộp bài"
                  variant="ghost"
                  onPress={confirmSubmit}
                  style={{ marginTop: spacing.sm }}
                />
              ) : null}
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}

function QuizResult({
  scored,
  onRetake,
  retaking,
}: {
  scored: Scored;
  onRetake: () => void;
  retaking: boolean;
}) {
  const percent = Math.round(scored.scorePercentage ?? 0);
  return (
    <Screen>
      <Stack.Screen options={{ title: "Kết quả" }} />
      <Card style={{ alignItems: "center", marginBottom: spacing.lg }}>
        <Ionicons
          name={scored.passed ? "trophy" : "refresh-circle"}
          size={48}
          color={scored.passed ? colors.accent : colors.primary}
        />
        <AppText variant="title">{percent}%</AppText>
        <AppText tone="muted">
          {scored.correctAnswerCount ?? 0}/{scored.questionCount} câu đúng ·{" "}
          {scored.score ?? 0}/{scored.maxScore} điểm
        </AppText>
        <View style={{ marginTop: spacing.sm }}>
          <Badge
            label={scored.passed ? "Đạt" : "Chưa đạt"}
            tone={scored.passed ? "success" : "danger"}
          />
        </View>
      </Card>

      <Row gap={spacing.sm} style={{ marginBottom: spacing.xl }}>
        <Button
          title="Làm lại"
          variant="secondary"
          loading={retaking}
          onPress={onRetake}
          style={{ flex: 1 }}
        />
        <Button
          title="Xong"
          onPress={() => router.back()}
          style={{ flex: 1 }}
        />
      </Row>

      {scored.reviews && scored.reviews.length > 0 ? (
        <Section title="Xem lại bài làm">
          {scored.reviews.map((review, index) => (
            <Card
              key={review.questionId}
              style={[
                styles.review,
                {
                  borderLeftColor: review.correct
                    ? colors.success
                    : colors.danger,
                },
              ]}
            >
              <AppText variant="caption" tone="muted">
                Câu {index + 1} · {review.pointsEarned}/{review.pointsPossible}{" "}
                điểm
              </AppText>
              <AppText variant="label">{review.prompt}</AppText>
              <AppText tone={review.correct ? "success" : "danger"}>
                Bạn chọn: {review.userAnswerText || "(bỏ trống)"}
              </AppText>
              {!review.correct && review.correctAnswerText ? (
                <AppText tone="success">
                  Đáp án: {review.correctAnswerText}
                </AppText>
              ) : null}
              {review.explanation ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  style={{ marginTop: spacing.xs }}
                >
                  {review.explanation}
                </AppText>
              ) : null}
            </Card>
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotCurrent: { borderWidth: 2, borderColor: colors.accent },
  review: { marginBottom: spacing.sm, borderLeftWidth: 4, gap: 2 },
});
