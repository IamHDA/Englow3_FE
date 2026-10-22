"use client";

import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { ArrowLeft } from "lucide-react";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useDictationLessonDetailQuery,
  useSubmitDictationMutation,
} from "@/lib/graphql/generated/hooks";
import { DictationPracticeSkeleton } from "../../blocks/DictationPracticeSkeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useDictationAudio } from "../../../hooks/useDictationAudio";
import { useDictationPractice } from "../../../hooks/useDictationPractice";
import { DictationAudioPlayer } from "../../blocks/DictationAudioPlayer";
import { DictationDiffResult } from "../../blocks/DictationDiffResult";
import { DictationInputArea } from "../../blocks/DictationInputArea";
import { DictationSessionSummary } from "../../blocks/DictationSessionSummary";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";

interface DictationPracticeViewProps {
  lessonId: string;
}

/**
 * Bài rỗng để hook luôn nhận đủ tham số trong lúc chờ dữ liệu. Không bao giờ
 * render ra - các nhánh loading và lỗi ở dưới chặn trước.
 */
const EMPTY_LESSON = {
  id: "",
  slug: "",
  title: "",
  topic: "",
  targetLevel: null,
  sentenceCount: 0,
  completedSentenceCount: 0,
  totalDurationSeconds: 0,
  lastPractisedAt: null,
  publishedAt: null,
};

export function DictationPracticeView({
  lessonId,
}: DictationPracticeViewProps) {
  const router = useRouter();
  const { isVi, t } = useLanguage();

  const { data, loading, error, refetch } = useDictationLessonDetailQuery({
    variables: { id: lessonId },
    fetchPolicy: "cache-and-network",
  });
  const [submitDictation] = useSubmitDictationMutation();

  const lesson = data?.dictationLesson.lesson;
  const sentences = useMemo(
    () => data?.dictationLesson.sentences ?? [],
    [data],
  );

  /**
   * Ghi một lần trả lời lên server. Câu đã được chấm ngay trên trình duyệt;
   * đây chỉ là việc lưu, và server chấm lại từ transcript của nó rồi mới ghi.
   */
  const recordAttempt = useCallback(
    async (sentenceId: string, typed: string) => {
      const response = await submitDictation({
        variables: { sentenceId, response: typed },
      }).catch(() => null);
      return Boolean(response?.data?.submitDictation);
    },
    [submitDictation],
  );

  const practice = useDictationPractice(
    lesson ?? EMPTY_LESSON,
    sentences,
    recordAttempt,
  );
  const updateReplayCount = practice.setReplayCount;

  const audio = useDictationAudio({
    audioUrl: practice.currentSentence?.audioUrl ?? null,
    durationSeconds: practice.currentSentence
      ? practice.currentSentence.audioDurationSeconds
      : 5,
    audioStartMs: practice.currentSentence?.audioStartMs,
    audioEndMs: practice.currentSentence?.audioEndMs,
  });
  const resetAudioReplayCount = audio.resetReplayCount;
  const restartSession = practice.restartPractice;
  const restartPractice = useCallback(() => {
    resetAudioReplayCount();
    restartSession();
  }, [resetAudioReplayCount, restartSession]);

  useEffect(() => {
    updateReplayCount(audio.replayCount);
  }, [audio.replayCount, updateReplayCount]);

  if (loading && lesson === undefined) {
    return <DictationPracticeSkeleton />;
  }

  if (error || lesson === undefined) {
    return (
      <Page width="focus">
        <LoadErrorState
          error={error}
          thing={{ vi: "bài nghe", en: "lesson" }}
          back={{
            href: "/study/dictation",
            label: t.dictation.backToLessonsButton,
          }}
          onRetry={() => void refetch().catch(() => undefined)}
        />
      </Page>
    );
  }

  if (practice.isCompleted) {
    return (
      <Page width="focus">
        <DictationSessionSummary
          summary={practice.summaryData}
          onRestart={restartPractice}
          onReviewMistakes={() => {
            router.push(`/study/dictation/${lesson.id}/review`);
          }}
        />
      </Page>
    );
  }

  if (sentences.length === 0) {
    return (
      <Page width="focus">
        <Alert color="blue">
          {isVi
            ? "Bài nghe này chưa có câu luyện tập. Vui lòng chọn bài khác."
            : "This lesson has no practice sentences yet. Please choose another lesson."}
          <Button component={Link} href="/study/dictation" variant="subtle">
            {isVi ? "Về thư viện" : "Back to lessons"}
          </Button>
        </Alert>
      </Page>
    );
  }

  return (
    <Page width="focus">
      <Stack gap="lg">
        {audio.error && (
          <Alert color="red" role="alert">
            {isVi
              ? "Không phát được âm thanh. Thử phát lại hoặc tải lại bài nghe."
              : "Audio is unavailable. Try playing again or reload the lesson."}
          </Alert>
        )}
        {/* Top Header Navigation Bar */}
        <Paper radius="md" p="md" withBorder bg="white">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm">
              <Button
                component={Link}
                href="/study/dictation"
                variant="subtle"
                color="navy"
                size="xs"
                radius="md"
                leftSection={<ArrowLeft size={14} />}
              >
                {t.dictation.backToLibraryButton}
              </Button>

              <Title order={2} size="h5" fw={700} c="ink.9">
                {lesson.title}
              </Title>
            </Group>

            <Group gap="xs">
              <Badge size="sm" variant="light" color="navy">
                {lesson.targetLevel ?? ""}
              </Badge>
              <Badge size="sm" variant="filled" color="orange">
                {t.dictation.queuePositionLabel
                  .replace("{current}", String(practice.currentIndex + 1))
                  .replace("{total}", String(practice.totalSentences))}
              </Badge>
            </Group>
          </Group>
        </Paper>

        {/* Waveform Audio Player */}
        <DictationAudioPlayer
          isPlaying={audio.isPlaying}
          currentTime={audio.currentTime}
          duration={audio.duration}
          playbackSpeed={audio.playbackSpeed}
          replayCount={audio.replayCount}
          onTogglePlay={() => {
            practice.startSession();
            audio.togglePlay();
          }}
          onReplay={() => {
            practice.startSession();
            audio.replay();
          }}
          onBack5={() => {
            practice.startSession();
            audio.back5();
          }}
          onForward5={() => {
            practice.startSession();
            audio.forward5();
          }}
          onChangeSpeed={audio.changeSpeed}
        />

        {/* Typing Input Area */}
        <DictationInputArea
          value={practice.typedText}
          onChange={practice.handleType}
          onSubmit={practice.submitOrAdvance}
          onSkip={practice.skipSentence}
          checked={practice.isChecked}
          disabled={practice.isAdvancing}
          focusKey={practice.currentIndex}
        />

        {practice.unsavedCount > 0 && !practice.isSaving && (
          <Alert
            color="yellow"
            title={
              isVi ? "Chưa lưu được một số câu" : "Some answers are not saved"
            }
          >
            {isVi
              ? "Kết quả vẫn hiện bình thường nhưng chưa được ghi vào lịch sử. Kiểm tra kết nối rồi thử lại."
              : "Your results are shown as usual but are not in your history yet. Check your connection and try again."}
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={practice.retrySaving}
            >
              {isVi ? "Lưu lại" : "Save again"}
            </Button>
          </Alert>
        )}

        {/* Checked Result Diff */}
        {practice.isChecked && practice.diffResult && (
          <DictationDiffResult
            diff={practice.diffResult}
            expectedSentence={practice.currentSentence.text}
            translationVi={practice.currentSentence.translationVi ?? null}
            onNextSentence={practice.nextSentence}
            onTryAgain={practice.tryAgain}
            onListenAgain={audio.replay}
            isLastSentence={
              practice.currentIndex + 1 >= practice.totalSentences
            }
          />
        )}
      </Stack>
    </Page>
  );
}
