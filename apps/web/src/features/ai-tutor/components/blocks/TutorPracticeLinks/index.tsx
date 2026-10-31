"use client";
import Link from "next/link";
import { Alert, Button, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { useQuizzesQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

/** Uses the existing published Quiz workflow; answer keys stay server-side until submission. */
export function TutorPracticeLinks() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const quizzes = useQuizzesQuery({
    variables: { page: 0, size: 6 },
    fetchPolicy: "cache-and-network",
  });
  return (
    <Card withBorder radius="md">
      <Stack gap="sm">
        <Text fw={600}>
          {tr(
            "Luyện tập rồi cùng Tutor xem lại",
            "Practise, then review with Tutor",
          )}
        </Text>
        <Text size="sm" c="dimmed">
          {tr(
            "Chọn bài luyện. Sau khi nộp, bạn có thể nhờ Tutor giải thích từng câu ngay từ trang kết quả.",
            "Choose a practice quiz. After submitting, ask Tutor about any question from your results.",
          )}
        </Text>
        {quizzes.loading && !quizzes.data && <Loader size="sm" />}
        {quizzes.error && (
          <Alert color="orange">
            {tr("Chưa tải được bài luyện.", "Could not load practice quizzes.")}
            <Button
              variant="subtle"
              onClick={() => void quizzes.refetch().catch(() => undefined)}
            >
              {tr("Thử lại", "Retry")}
            </Button>
          </Alert>
        )}
        {quizzes.data?.quizzes.items.map((quiz) => (
          <Group key={quiz.id} justify="space-between" wrap="wrap">
            <Text size="sm">
              {quiz.title} · {quiz.questionCount} {tr("câu", "questions")}
            </Text>
            <Button
              component={Link}
              href={`/study/quiz/${quiz.id}`}
              variant="light"
              mih={44}
            >
              {tr("Mở bài luyện", "Open practice")}
            </Button>
          </Group>
        ))}
        {quizzes.data?.quizzes.items.length === 0 && (
          <Text size="sm" c="dimmed">
            {tr(
              "Chưa có bài Quiz được xuất bản. Bạn vẫn có thể luyện bằng hội thoại ở bên dưới.",
              "No published quizzes yet. You can still practise through the conversation below.",
            )}
          </Text>
        )}
        <Button
          component={Link}
          href="/study/daily-path?tab=quizzes"
          variant="subtle"
        >
          {tr("Xem thư viện bài luyện", "Browse practice library")}
        </Button>
      </Stack>
    </Card>
  );
}
