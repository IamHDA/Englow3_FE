import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

import { formatDuration } from "@/features/shared/labels";
import { backendCodeOf, errorMessage } from "@/lib/errors";
import {
  ExamAttemptMode,
  ExamType,
  OpenAttemptChoice,
  useExamDetailQuery,
  useExamOutlineQuery,
  useStartExamAttemptMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Choice,
  Notice,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

const SECTION_LABELS: Record<string, string> = {
  LISTENING: "Nghe",
  READING: "Đọc",
  WRITING: "Viết",
  SPEAKING: "Nói",
};

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useExamDetailQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  const outline = useExamOutlineQuery({ variables: { examId: id } });
  const [start, startState] = useStartExamAttemptMutation();
  const [mode, setMode] = useState<ExamAttemptMode>(ExamAttemptMode.FULL);
  const [partIds, setPartIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function begin(onOpen?: OpenAttemptChoice) {
    setError(null);
    try {
      const { data } = await start({
        variables: {
          examId: id,
          input: {
            mode,
            ...(mode === ExamAttemptMode.PRACTICE && partIds.length
              ? { partIds }
              : {}),
            ...(onOpen ? { onOpen } : {}),
          },
        },
      });
      if (data) {
        router.push({
          pathname: "/exams/sitting/[attemptId]",
          params: { attemptId: data.startExamAttempt.id },
        });
      }
    } catch (failure) {
      if (backendCodeOf(failure) === "ATTEMPT_IN_PROGRESS") {
        Alert.alert(
          "Bạn đang có một lượt làm dở",
          "Tiếp tục lượt cũ, hay nộp lượt cũ và bắt đầu lượt mới?",
          [
            { text: "Huỷ", style: "cancel" },
            {
              text: "Làm mới",
              style: "destructive",
              onPress: () => void begin(OpenAttemptChoice.REPLACE),
            },
            {
              text: "Tiếp tục",
              onPress: () => void begin(OpenAttemptChoice.RESUME),
            },
          ],
        );
        return;
      }
      setError(
        errorMessage(failure, {
          EXAM_NOT_PUBLISHED: "Đề này chưa được xuất bản.",
        }),
      );
    }
  }

  return (
    <Screen>
      <QueryView
        loading={detail.loading}
        error={detail.error}
        data={detail.data?.exam}
        onRetry={() => void detail.refetch()}
      >
        {(exam) => {
          const fullOnly =
            exam.examType === ExamType.LEVEL_CHECK ||
            exam.examType === ExamType.PLACEMENT;
          const sections = outline.data?.examOutline.sections ?? [];
          return (
            <>
              <Stack.Screen options={{ title: exam.title }} />
              <Card style={{ marginBottom: spacing.lg }}>
                <AppText variant="heading">{exam.title}</AppText>
                {exam.description ? (
                  <AppText tone="muted">{exam.description}</AppText>
                ) : null}
                <Row wrap gap={spacing.sm} style={{ marginTop: spacing.sm }}>
                  {exam.certificateType ? (
                    <Badge label={exam.certificateType} />
                  ) : null}
                  {exam.certificateVariant ? (
                    <Badge label={exam.certificateVariant} tone="neutral" />
                  ) : null}
                  <Badge label={`${exam.questionCount} câu`} tone="neutral" />
                  <Badge
                    label={formatDuration(exam.durationSeconds)}
                    tone="neutral"
                  />
                  {exam.bestScorePercentage != null ? (
                    <Badge
                      label={`Tốt nhất ${Math.round(exam.bestScorePercentage)}%`}
                      tone="success"
                    />
                  ) : null}
                </Row>
              </Card>

              {sections.length > 0 ? (
                <Section title="Cấu trúc đề">
                  {[...sections]
                    .sort((a, b) => a.orderNo - b.orderNo)
                    .map((section) => (
                      <View
                        key={section.id}
                        style={{ marginBottom: spacing.sm }}
                      >
                        <AppText variant="label">
                          {SECTION_LABELS[section.sectionType] ??
                            section.sectionType}
                        </AppText>
                        {section.parts.map((part) =>
                          mode === ExamAttemptMode.PRACTICE ? (
                            <Choice
                              key={part.id}
                              label={`${part.title} · ${part.questionCount} câu`}
                              selected={partIds.includes(part.id)}
                              onPress={() =>
                                setPartIds((current) =>
                                  current.includes(part.id)
                                    ? current.filter((item) => item !== part.id)
                                    : [...current, part.id],
                                )
                              }
                            />
                          ) : (
                            <AppText
                              key={part.id}
                              variant="caption"
                              tone="muted"
                            >
                              • {part.title} · {part.questionCount} câu
                            </AppText>
                          ),
                        )}
                      </View>
                    ))}
                </Section>
              ) : null}

              {!fullOnly ? (
                <Row gap={spacing.sm} style={{ marginBottom: spacing.md }}>
                  <Choice
                    label="Thi thật (tính giờ)"
                    selected={mode === ExamAttemptMode.FULL}
                    onPress={() => setMode(ExamAttemptMode.FULL)}
                  />
                  <Choice
                    label="Luyện tập"
                    selected={mode === ExamAttemptMode.PRACTICE}
                    onPress={() => setMode(ExamAttemptMode.PRACTICE)}
                  />
                </Row>
              ) : null}
              {mode === ExamAttemptMode.PRACTICE ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  style={{ marginBottom: spacing.sm }}
                >
                  Chọn phần muốn luyện ở trên; không chọn nghĩa là làm cả đề.
                </AppText>
              ) : null}

              <Notice message={error} />
              <Button
                title="Bắt đầu làm bài"
                icon="play"
                loading={startState.loading}
                onPress={() => void begin()}
              />
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
