"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  List,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FullTestSittingStatus } from "@/lib/graphql/generated/schemaTypes";
import {
  useFullTestLibraryQuery,
  useStartFullTestMutation,
} from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";
import {
  IELTS_ONLY_CODE,
  FULL_TEST_ERROR_COPY,
} from "../../../constants/fullTest";
import { FullTestLibrarySkeleton } from "../../blocks/FullTestLibrarySkeleton";

/**
 * One full test before it is started: what it holds and how long there is.
 * Starting hands back the sitting still open for this test rather than a
 * second one - the backend allows only one at a time.
 */
export function FullTestStartView({ fullTestId }: { fullTestId: string }) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const router = useRouter();
  const [refusal, setRefusal] = useState<string | null>(null);
  const { data, loading, error, refetch } = useFullTestLibraryQuery({
    fetchPolicy: "cache-and-network",
  });
  const [start, startState] = useStartFullTestMutation();

  if (loading && !data) return <FullTestLibrarySkeleton />;
  const test = data?.fullTests.find((candidate) => candidate.id === fullTestId);
  if (!test)
    return (
      <LoadErrorState
        error={error}
        kind={error ? undefined : "not-found"}
        thing={{ vi: "full test này", en: "this full test" }}
        back={{ href: "/exams/full-tests", label: "IELTS Full Test" }}
        onRetry={() => void refetch()}
      />
    );
  const open = data?.myFullTestSittings.find(
    (sitting) =>
      sitting.fullTestId === fullTestId &&
      sitting.status === FullTestSittingStatus.IN_PROGRESS,
  );

  const onStart = async () => {
    setRefusal(null);
    try {
      const response = await start({ variables: { fullTestId } });
      const sitting = response.data?.startFullTest;
      if (sitting) router.push(`/exams/full-tests/sittings/${sitting.id}`);
    } catch (failure) {
      const copy = FULL_TEST_ERROR_COPY[backendCodeOf(failure) ?? ""];
      setRefusal(
        backendCodeOf(failure) === IELTS_ONLY_CODE
          ? tr(
              "Full test dành cho người đang luyện thi IELTS. Hãy chọn mục tiêu IELTS trong hồ sơ trước.",
              "The full test is for learners preparing for IELTS. Choose an IELTS goal in your profile first.",
            )
          : copy
            ? isVi
              ? copy.vi
              : copy.en
            : tr(
                "Chưa bắt đầu được. Kiểm tra kết nối rồi thử lại.",
                "Could not start. Check your connection and try again.",
              ),
      );
    }
  };

  return (
    <Page width="focus">
      <Stack gap="lg">
        <PageHeader
          title={test.title}
          above={
            <Text
              component={Link}
              href="/exams/full-tests"
              size="sm"
              c="dimmed"
            >
              ← IELTS Full Test
            </Text>
          }
        />
        <Group gap="xs">
          <Badge variant="light">{test.certificateVariant}</Badge>
        </Group>
        {test.description && <Text>{test.description}</Text>}
        <Card withBorder radius="md" p="lg">
          <List spacing="xs">
            <List.Item>
              {tr(
                "Listening và Reading làm liền một đề, có band ngay khi nộp.",
                "Listening and Reading are one paper, banded as soon as you hand it in.",
              )}
            </List.Item>
            <List.Item>
              {tr(
                "Writing Task 1, Task 2 và Speaking Part 1–3 làm ở trang riêng, được chấm tự động hoặc giáo viên chấm.",
                "Writing Tasks 1 and 2 and Speaking Parts 1-3 are answered on their own pages, with automatic or teacher assessment.",
              )}
            </List.Item>
            <List.Item>
              {tr(
                "Đây là bộ đánh giá luyện tập bốn kỹ năng, cho phép làm từng phần trong 7 ngày. Writing hiển thị thời lượng gợi ý.",
                "This four-skill practice assessment lets you complete the parts within seven days. Writing displays suggested timings.",
              )}
            </List.Item>
          </List>
        </Card>
        {refusal && (
          <Alert color="red" variant="light">
            {refusal}
          </Alert>
        )}
        {open ? (
          <Button
            component={Link}
            href={`/exams/full-tests/sittings/${open.id}`}
            size="md"
            w="fit-content"
          >
            {tr("Làm tiếp lượt đang mở", "Continue your open sitting")}
          </Button>
        ) : (
          <Button
            size="md"
            w="fit-content"
            loading={startState.loading}
            onClick={() => void onStart()}
          >
            {tr("Bắt đầu full test", "Start the full test")}
          </Button>
        )}
      </Stack>
    </Page>
  );
}
