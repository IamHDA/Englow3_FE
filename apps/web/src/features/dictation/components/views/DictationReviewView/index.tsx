"use client";

import {
  Alert,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Title,
} from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useCallback } from "react";

import {
  useDictationMistakesQuery,
  useSubmitDictationMutation,
} from "@/lib/graphql/generated/hooks";

import { DictationMistakeQueue } from "../../blocks/DictationMistakeQueue";
import { Page } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

/**
 * Những câu người học hay sai, trên toàn bộ bài học chứ không riêng một bài.
 *
 * Trước đây tiêu đề là "Ôn tập câu sai — {lessonTitle}" với `lessonTitle` được
 * route truyền vào bằng chuỗi rỗng, còn danh sách thì là bốn câu viết sẵn.
 * "Câu nào tôi hay sai" là câu hỏi về người học, không phải về một bài, nên
 * giờ nó hỏi đúng như vậy.
 */
export function DictationReviewView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const { data, loading, error } = useDictationMistakesQuery({
    fetchPolicy: "cache-and-network",
  });

  const [submitDictation] = useSubmitDictationMutation();

  const mistakes = data?.dictationMistakes ?? [];

  /**
   * Chấm trên server, như màn luyện tập. Trước đây màn này chấm ngay trong
   * trình duyệt rồi thôi - không lượt làm nào được ghi, nên câu đã ôn xong vẫn
   * quay lại ở lần mở sau. Trả về null khi gọi hỏng, để block nói thẳng là chưa
   * chấm được thay vì tự bịa ra một kết quả.
   */
  const checkSentence = useCallback(
    async (sentenceId: string, typed: string) => {
      const response = await submitDictation({
        variables: { sentenceId, response: typed },
      }).catch(() => null);
      return response?.data?.submitDictation ?? null;
    },
    [submitDictation],
  );

  return (
    <Page width="focus">
      <Stack gap="lg">
        <Paper radius="md" p="md" withBorder bg="white">
          <Group justify="space-between" align="center">
            <Button
              component={Link}
              href="/study/dictation"
              variant="subtle"
              color="navy"
              size="xs"
              radius="md"
              leftSection={<ArrowLeft size={14} />}
            >
              {tr("Về thư viện bài học", "Back to the lessons")}
            </Button>

            <Title order={2} size="h5" fw={700} c="ink.9">
              {tr("Những câu bạn hay sai", "Sentences you often miss")}
            </Title>
          </Group>
        </Paper>

        {error && mistakes.length === 0 ? (
          <Alert
            color="warn"
            title={tr(
              "Không tải được danh sách câu sai",
              "Could not load your missed sentences",
            )}
          >
            {tr(
              "Kiểm tra kết nối tới backend rồi tải lại trang.",
              "Check the connection to the server, then reload the page.",
            )}
          </Alert>
        ) : loading && mistakes.length === 0 ? (
          <Skeleton height={420} radius="md" />
        ) : (
          <DictationMistakeQueue mistakes={mistakes} onCheck={checkSentence} />
        )}
      </Stack>
    </Page>
  );
}
