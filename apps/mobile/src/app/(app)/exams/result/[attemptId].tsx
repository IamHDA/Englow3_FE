import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { questionNumberLabel } from "@/features/exam/answers";
import { formatDuration } from "@/features/shared/labels";
import { useExamAttemptResultQuery } from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  ProgressBar,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, spacing } from "@/ui/theme";

const SECTION_LABELS: Record<string, string> = {
  LISTENING: "Nghe",
  READING: "Đọc",
  WRITING: "Viết",
  SPEAKING: "Nói",
};

export default function ExamResultScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const result = useExamAttemptResultQuery({
    variables: { id: attemptId },
    fetchPolicy: "cache-and-network",
  });

  return (
    <Screen>
      <Stack.Screen options={{ title: "Kết quả" }} />
      <QueryView
        loading={result.loading}
        error={result.error}
        data={result.data?.examAttempt}
        onRetry={() => void result.refetch()}
      >
        {(attempt) => {
          const percent = Math.round(attempt.scorePercentage ?? 0);
          const sorted = [...(attempt.questions ?? [])].sort(
            (a, b) => a.numberFrom - b.numberFrom,
          );
          return (
            <>
              <Card style={{ alignItems: "center", marginBottom: spacing.lg }}>
                <Ionicons name="ribbon" size={40} color={colors.accent} />
                <AppText variant="heading">{attempt.examTitle}</AppText>
                {attempt.convertedScore != null ? (
                  <AppText variant="title" tone="primary">
                    {attempt.convertedScore}
                  </AppText>
                ) : (
                  <AppText variant="title" tone="primary">
                    {percent}%
                  </AppText>
                )}
                <AppText tone="muted">
                  {attempt.correctAnswerCount ?? 0}/{attempt.questionCount} câu
                  đúng · {attempt.rawScore ?? 0}/{attempt.maxRawScore} điểm
                </AppText>
                {attempt.status === "EXPIRED" ? (
                  <Badge label="Hết giờ - tính theo bài đã lưu" tone="accent" />
                ) : null}
              </Card>

              {attempt.sections && attempt.sections.length > 0 ? (
                <Section title="Theo kỹ năng">
                  {attempt.sections.map((section) => (
                    <View
                      key={section.sectionType}
                      style={{ marginBottom: spacing.sm }}
                    >
                      <Row style={{ justifyContent: "space-between" }}>
                        <AppText variant="label">
                          {SECTION_LABELS[section.sectionType] ??
                            section.sectionType}
                        </AppText>
                        <AppText>
                          {section.band != null
                            ? `Band ${section.band}`
                            : `${section.rawScore}/${section.maxRawScore}`}
                        </AppText>
                      </Row>
                      <ProgressBar
                        value={
                          section.maxRawScore > 0
                            ? (section.rawScore ?? 0) / section.maxRawScore
                            : 0
                        }
                      />
                      <AppText variant="caption" tone="muted">
                        {section.correctAnswerCount}/{section.questionCount} câu
                        đúng
                      </AppText>
                    </View>
                  ))}
                </Section>
              ) : null}

              {sorted.length > 0 ? (
                <Section title="Đáp án">
                  {sorted.map((review) => (
                    <Card
                      key={review.questionId}
                      style={{
                        marginBottom: spacing.sm,
                        borderLeftWidth: 4,
                        borderLeftColor: review.correct
                          ? colors.success
                          : colors.danger,
                      }}
                    >
                      <Row style={{ justifyContent: "space-between" }}>
                        <AppText variant="label">
                          Câu {questionNumberLabel(review)}
                        </AppText>
                        <Badge
                          label={review.correct ? "Đúng" : "Sai"}
                          tone={review.correct ? "success" : "danger"}
                        />
                      </Row>
                      {review.textAnswer != null ? (
                        <AppText tone={review.correct ? "success" : "danger"}>
                          Bạn điền: {review.textAnswer || "(bỏ trống)"}
                        </AppText>
                      ) : null}
                      {!review.correct &&
                      review.acceptedAnswers &&
                      review.acceptedAnswers.length > 0 ? (
                        <AppText tone="success">
                          Đáp án: {review.acceptedAnswers.join(" / ")}
                        </AppText>
                      ) : null}
                      {review.explanation ? (
                        <AppText variant="caption" tone="muted">
                          {review.explanation}
                        </AppText>
                      ) : null}
                    </Card>
                  ))}
                </Section>
              ) : null}

              {attempt.timeLimitSeconds != null ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  style={{ marginBottom: spacing.md }}
                >
                  Thời gian cho phép: {formatDuration(attempt.timeLimitSeconds)}
                </AppText>
              ) : null}
              <Row gap={spacing.sm}>
                <Button
                  title="Làm lại đề"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={() =>
                    router.replace({
                      pathname: "/exams/[id]",
                      params: { id: attempt.examId },
                    })
                  }
                />
                <Button
                  title="Xong"
                  style={{ flex: 1 }}
                  onPress={() => router.dismissTo("/exams")}
                />
              </Row>
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
