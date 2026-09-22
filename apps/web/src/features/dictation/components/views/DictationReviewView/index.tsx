"use client";

import {
  Alert,
  Button,
  Container,
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
import { useDictationMistakesQuery } from "@/lib/graphql/generated/hooks";

import { DictationMistakeQueue } from "../../blocks/DictationMistakeQueue";

/**
 * Những câu người học hay sai, trên toàn bộ bài học chứ không riêng một bài.
 *
 * Trước đây tiêu đề là "Ôn tập câu sai — {lessonTitle}" với `lessonTitle` được
 * route truyền vào bằng chuỗi rỗng, còn danh sách thì là bốn câu viết sẵn.
 * "Câu nào tôi hay sai" là câu hỏi về người học, không phải về một bài, nên
 * giờ nó hỏi đúng như vậy.
 */
export function DictationReviewView() {
  const { data, loading, error } = useDictationMistakesQuery({
    fetchPolicy: "cache-and-network",
  });

  const mistakes = data?.dictationMistakes ?? [];

  return (
    <Container size="md" py="xl">
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
              Về thư viện bài học
            </Button>

            <Title order={2} size="h5" fw={700} c="ink.9">
              Những câu bạn hay sai
            </Title>
          </Group>
        </Paper>

        {error && mistakes.length === 0 ? (
          <Alert color="warn" title="Không tải được danh sách câu sai">
            Kiểm tra kết nối tới backend rồi tải lại trang.
          </Alert>
        ) : loading && mistakes.length === 0 ? (
          <Skeleton height={420} radius="md" />
        ) : (
          <DictationMistakeQueue mistakes={mistakes} />
        )}
      </Stack>
    </Container>
  );
}
