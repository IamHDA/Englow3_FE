"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  List,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { BookOpen, Mic, PenLine } from "lucide-react";
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
import {
  fullTestSittingPath,
  ieltsLibraryPath,
  paperPracticePath,
} from "@/shared/constants/fullTestNavigation";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";
import {
  IELTS_ONLY_CODE,
  FULL_TEST_ERROR_COPY,
  SLOT_COPY,
  SLOT_TASKS,
  STATUS_COPY,
} from "../../../constants/fullTest";
import { FullTestLibrarySkeleton } from "../../blocks/FullTestLibrarySkeleton";

/**
 * One IELTS full test, opened from the library's IELTS tab. Like a TOEIC
 * paper it has two ways in (D-IELTS-11):
 * - practice: any part on its own - Listening/Reading parts of the paper, or
 *   one Writing or Speaking task. Kept in history, never a band.
 * - the real thing: a sitting with seven days to hand every part in and one
 *   overall band (D-IELTS-10). Starting hands back the sitting still open for
 *   this test rather than a second one - the backend allows one at a time.
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
        back={{
          href: ieltsLibraryPath(),
          label: tr("Thư viện đề", "Exam library"),
        }}
        onRetry={() => void refetch()}
      />
    );
  const mine = (data?.myFullTestSittings ?? []).filter(
    (sitting) => sitting.fullTestId === fullTestId,
  );
  const open = mine.find(
    (sitting) => sitting.status === FullTestSittingStatus.IN_PROGRESS,
  );
  const variantLabel =
    test.certificateVariant === "GENERAL" ? "General" : "Academic";

  const onStart = async () => {
    setRefusal(null);
    try {
      const response = await start({ variables: { fullTestId } });
      const sitting = response.data?.startFullTest;
      if (sitting) router.push(fullTestSittingPath(sitting.id));
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

  const practiceParts = [
    {
      key: "paper",
      icon: <BookOpen size={18} aria-hidden="true" />,
      title: "Listening + Reading",
      hint: tr(
        "Chọn part và giờ làm, như luyện đề TOEIC.",
        "Pick the parts and a clock, as with a TOEIC paper.",
      ),
      href: paperPracticePath(test.examId, test.id),
    },
    ...SLOT_TASKS.map(({ slot, field, skill }) => ({
      key: slot,
      icon:
        skill === "WRITING" ? (
          <PenLine size={18} aria-hidden="true" />
        ) : (
          <Mic size={18} aria-hidden="true" />
        ),
      title: isVi ? SLOT_COPY[slot].vi : SLOT_COPY[slot].en,
      hint:
        skill === "WRITING"
          ? tr(
              "Viết bài, được chấm theo 4 tiêu chí.",
              "Write it and get a four-criterion grade.",
            )
          : tr(
              "Ghi âm câu trả lời, được chấm theo 4 tiêu chí.",
              "Record your answer and get a four-criterion grade.",
            ),
      href: `${SLOT_COPY[slot].path}/${test[field]}`,
    })),
  ];

  return (
    <Page width="focus">
      <Stack gap="lg">
        <PageHeader
          title={test.title}
          above={
            <Text
              component={Link}
              href={ieltsLibraryPath(test.certificateVariant)}
              size="sm"
              c="dimmed"
            >
              ← {tr("Thư viện đề", "Exam library")} · IELTS {variantLabel}
            </Text>
          }
        />
        <Group gap="xs">
          <Badge variant="light">IELTS {variantLabel}</Badge>
          <Badge variant="light" color="gray">
            Listening · Reading · Writing · Speaking
          </Badge>
        </Group>
        {test.description && <Text>{test.description}</Text>}

        <Tabs
          defaultValue={open ? "full" : "practice"}
          radius="md"
          keepMounted={false}
        >
          <Tabs.List mb="md">
            <Tabs.Tab value="practice">{tr("Luyện tập", "Practice")}</Tabs.Tab>
            <Tabs.Tab value="full">
              {tr("Thi thật (full test)", "Full test")}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="practice">
            <Stack gap="sm">
              <Text size="sm" c="ink.6">
                {tr(
                  "Làm riêng từng phần của đề này. Bài luyện tập chỉ lưu vào lịch sử, không ra band tổng và không tính vào kiểm tra đầu vào.",
                  "Take any part of this test on its own. A practice is kept in your history only - it gives no overall band and does not count toward placement.",
                )}
              </Text>
              {practiceParts.map((part) => (
                <Card key={part.key} withBorder radius="md" p="md">
                  <Group justify="space-between" wrap="nowrap" gap="md">
                    <Group gap="sm" wrap="nowrap">
                      {part.icon}
                      <Stack gap={2}>
                        <Text fw={600}>{part.title}</Text>
                        <Text size="sm" c="dimmed">
                          {part.hint}
                        </Text>
                      </Stack>
                    </Group>
                    <Button
                      component={Link}
                      href={part.href}
                      variant="light"
                      style={{ flexShrink: 0 }}
                    >
                      {tr("Luyện", "Practise")}
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="full">
            <Stack gap="lg">
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
                      "Được nghỉ giữa các phần, miễn là nộp đủ trong 7 ngày kể từ lúc bắt đầu. Nộp đủ thì có một band tổng.",
                      "You may break between parts, as long as everything is handed in within seven days of starting. Then you get one overall band.",
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
                  href={fullTestSittingPath(open.id)}
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

              {mine.length > 0 && (
                <Stack gap="sm">
                  <Title order={2} size="h5">
                    {tr("Các lượt của bạn", "Your sittings")}
                  </Title>
                  {mine.map((sitting) => {
                    const status = STATUS_COPY[sitting.status];
                    const band = sitting.overallBand ?? sitting.provisionalBand;
                    return (
                      <Card key={sitting.id} withBorder radius="md" p="sm">
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="xs">
                            <Badge color={status.color} variant="light">
                              {isVi ? status.vi : status.en}
                            </Badge>
                            <Text size="sm" c="dimmed">
                              {new Date(sitting.startedAt).toLocaleDateString(
                                isVi ? "vi-VN" : "en-GB",
                              )}
                            </Text>
                            {band != null && (
                              <Text size="sm" fw={600}>
                                Band {band.toFixed(1)}
                                {sitting.overallBand == null
                                  ? tr(" (tạm)", " (provisional)")
                                  : ""}
                              </Text>
                            )}
                          </Group>
                          <Button
                            component={Link}
                            href={fullTestSittingPath(sitting.id)}
                            variant="subtle"
                            size="xs"
                          >
                            {tr("Mở", "Open")}
                          </Button>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Page>
  );
}
