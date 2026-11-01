"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Check, Headphones, Mic } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAccountProfile } from "@/features/account";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import {
  LevelCheckPurpose,
  LevelCheckStatus,
} from "@/lib/graphql/generated/schemaTypes";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useLatestLevelCheckQuery,
  useSkipLevelCheckSpeakingMutation,
} from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import {
  GENERIC_ROADMAP_ERROR,
  ROADMAP_ERROR_MESSAGES,
} from "../../constants/roadmap";

/** How often to look again while a part is being graded. */
const POLL_MS = 8000;

/**
 * Bài đo trình độ ba phần. Người học làm đề từ vựng/ngữ pháp + nghe trên màn
 * thi bình thường và trả lời đề Nói trên màn Nói bình thường; mỗi lần trang này
 * được mở (và vài giây một lần khi đang chờ chấm), backend tự nhận lượt làm và
 * điểm mới, rồi ghép ba phần thành trình độ khi đủ.
 */
export function LevelCheckView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const { open } = useOnboarding();
  const { refresh } = useAccountProfile();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, loading, error, refetch, startPolling, stopPolling } =
    useLatestLevelCheckQuery({ fetchPolicy: "network-only" });
  const [skipSpeaking, skipState] = useSkipLevelCheckSpeakingMutation();

  const check = data?.latestLevelCheck ?? null;
  const gradingSpeech =
    check != null &&
    check.status !== LevelCheckStatus.COMPLETED &&
    check.speakingAttemptId != null &&
    check.speakingLevel == null &&
    !check.speakingFailed &&
    !check.speakingSkipped;
  useEffect(() => {
    if (gradingSpeech) startPolling(POLL_MS);
    else stopPolling();
  }, [gradingSpeech, startPolling, stopPolling]);

  if (loading && !data) {
    return (
      <Page width="focus">
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      </Page>
    );
  }

  if (error && !data) {
    return (
      <Page width="focus">
        <Alert color="warn" radius="lg">
          {tr(
            "Không tải được bài đo trình độ.",
            "Could not load the level test.",
          )}
          <Button
            variant="light"
            ml="sm"
            onClick={() => void refetch().catch(() => {})}
          >
            {tr("Thử lại", "Retry")}
          </Button>
        </Alert>
      </Page>
    );
  }

  if (!check) {
    return (
      <Page width="focus">
        <PageHeader title={tr("Bài đo trình độ", "Level test")} />
        <Text c="dimmed">
          {tr(
            "Bạn chưa bắt đầu bài đo trình độ nào. Bài đo được mở từ bước trình độ khi thiết lập tài khoản, hoặc từ mốc cuối giai đoạn trong lộ trình.",
            "You have not started a level test. It opens from the level step of your setup, or from a stage milestone on your roadmap.",
          )}
        </Text>
      </Page>
    );
  }

  const completed = check.status === LevelCheckStatus.COMPLETED;
  const paperDone = check.vocabLevel != null && check.listeningLevel != null;
  const speakingDone = check.speakingLevel != null || check.speakingSkipped;
  // One orange action at a time: the next part to do.
  const nextPart = !paperDone ? "paper" : !speakingDone ? "speaking" : null;

  async function handleSkip() {
    if (!check) return;
    setErrorMessage(null);
    try {
      await skipSpeaking({ variables: { id: check.id } });
    } catch (skipError) {
      const code = backendCodeOf(skipError);
      const words =
        (code && ROADMAP_ERROR_MESSAGES[code]) || GENERIC_ROADMAP_ERROR;
      setErrorMessage(isVi ? words.vi : words.en);
    }
  }

  function handleContinueSetup() {
    void refresh();
    open();
  }

  return (
    <Page width="focus">
      <PageHeader
        title={tr("Bài đo trình độ", "Level test")}
        actions={
          !completed && (
            <Button
              variant="subtle"
              onClick={() => void refetch().catch(() => {})}
            >
              {tr("Cập nhật kết quả", "Refresh results")}
            </Button>
          )
        }
      />
      <Stack gap="lg">
        <Text c="dimmed">
          {tr(
            "Ba phần: từ vựng và ngữ pháp, nghe, nói. Làm xong mỗi phần, quay lại trang này để xem kết quả.",
            "Three parts: vocabulary and grammar, listening, speaking. After each part, come back here for the result.",
          )}
        </Text>

        <Card withBorder radius="lg">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="md" wrap="nowrap" align="flex-start">
              <ThemeIcon variant="light" size="lg" radius="md">
                {paperDone ? (
                  <Check size={18} aria-hidden="true" />
                ) : (
                  <Headphones size={18} aria-hidden="true" />
                )}
              </ThemeIcon>
              <Stack gap={4}>
                <Title order={3} size="h4">
                  {tr(
                    "1. Từ vựng, ngữ pháp và nghe",
                    "1. Vocabulary, grammar and listening",
                  )}
                </Title>
                {paperDone ? (
                  <Text size="sm">
                    {tr("Từ vựng và ngữ pháp", "Vocabulary and grammar")}:{" "}
                    <b>{check.vocabLevel}</b> · {tr("Nghe", "Listening")}:{" "}
                    <b>{check.listeningLevel}</b>
                  </Text>
                ) : (
                  <Text size="sm" c="dimmed">
                    {check.examAttemptId
                      ? tr(
                          "Bạn đang làm dở bài này. Nộp bài để có kết quả.",
                          "You have this paper open. Submit it to get a result.",
                        )
                      : tr(
                          "Một đề trắc nghiệm có phần nghe, làm trọn trong một lần.",
                          "A multiple-choice paper with a listening part, taken in one go.",
                        )}
                  </Text>
                )}
              </Stack>
            </Group>
            {!paperDone && (
              <Button
                component={Link}
                href={`/exams/${check.examId}`}
                color={nextPart === "paper" ? "orange" : undefined}
                variant={nextPart === "paper" ? "filled" : "light"}
              >
                {check.examAttemptId
                  ? tr("Tiếp tục", "Continue")
                  : tr("Làm bài", "Start")}
              </Button>
            )}
          </Group>
        </Card>

        <Card withBorder radius="lg">
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap="md" wrap="nowrap" align="flex-start">
                <ThemeIcon variant="light" size="lg" radius="md">
                  {speakingDone ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    <Mic size={18} aria-hidden="true" />
                  )}
                </ThemeIcon>
                <Stack gap={4}>
                  <Title order={3} size="h4">
                    {tr("2. Nói", "2. Speaking")}
                  </Title>
                  <Text
                    size="sm"
                    c={check.speakingLevel ? undefined : "dimmed"}
                  >
                    {check.speakingLevel
                      ? `${tr("Nói", "Speaking")}: ${check.speakingLevel}`
                      : check.speakingSkipped
                        ? tr(
                            "Đã bỏ qua. Trình độ được tính từ hai phần còn lại.",
                            "Skipped. Your level comes from the other two parts.",
                          )
                        : check.speakingFailed
                          ? tr(
                              "Không chấm được bài nói. Bạn có thể ghi âm lại hoặc bỏ qua phần này.",
                              "Your answer could not be graded. Record it again or skip this part.",
                            )
                          : gradingSpeech
                            ? tr(
                                "Đang chấm bài nói, thường mất dưới một phút.",
                                "Grading your answer, usually under a minute.",
                              )
                            : tr(
                                "Trả lời một câu hỏi bằng giọng nói, khoảng 1-2 phút.",
                                "Answer one question out loud, about 1-2 minutes.",
                              )}
                  </Text>
                </Stack>
              </Group>
              {gradingSpeech && <Loader size="sm" />}
              {!speakingDone &&
                !gradingSpeech &&
                check.speakingTaskId != null && (
                  <Button
                    component={Link}
                    href={`/study/speaking/${check.speakingTaskId}`}
                    color={nextPart === "speaking" ? "orange" : undefined}
                    variant={nextPart === "speaking" ? "filled" : "light"}
                  >
                    {check.speakingFailed
                      ? tr("Ghi âm lại", "Record again")
                      : tr("Trả lời", "Answer")}
                  </Button>
                )}
            </Group>
            {!speakingDone && !completed && (
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  size="compact-sm"
                  loading={skipState.loading}
                  onClick={() => void handleSkip()}
                >
                  {tr(
                    "Không dùng được micro? Bỏ qua phần nói",
                    "No microphone? Skip speaking",
                  )}
                </Button>
              </Group>
            )}
          </Stack>
        </Card>

        {errorMessage && (
          <Alert color="warn" radius="md">
            {errorMessage}
          </Alert>
        )}

        <Card withBorder radius="lg" bg={completed ? "teal.0" : undefined}>
          <Stack gap="sm">
            <Title order={3} size="h4">
              {tr("Kết quả", "Result")}
            </Title>
            {completed ? (
              <>
                <Group gap="sm">
                  <Text>{tr("Trình độ của bạn", "Your level")}</Text>
                  <Badge size="xl" color="teal">
                    {check.resultLevel}
                  </Badge>
                </Group>
                {check.purpose === LevelCheckPurpose.ONBOARDING ? (
                  <Group>
                    <Button color="orange" onClick={handleContinueSetup}>
                      {tr("Tiếp tục đặt mục tiêu", "Continue to your goal")}
                    </Button>
                  </Group>
                ) : (
                  <Group>
                    <Button
                      component={Link}
                      href="/study/roadmap"
                      color="orange"
                    >
                      {tr("Về lộ trình", "Back to your roadmap")}
                    </Button>
                  </Group>
                )}
              </>
            ) : check.provisionalLevel ? (
              <Text size="sm">
                {tr("Tạm tính từ phần đã làm", "So far, from the parts done")}:{" "}
                <b>{check.provisionalLevel}</b>.{" "}
                {tr(
                  "Kết quả chính thức có sau phần nói.",
                  "The final result comes after the speaking part.",
                )}
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                {tr(
                  "Kết quả hiện ra khi bạn làm xong các phần.",
                  "Your result appears once the parts are done.",
                )}
              </Text>
            )}
          </Stack>
        </Card>
      </Stack>
    </Page>
  );
}
