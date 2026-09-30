"use client";

import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Title,
  Text,
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
import { useCallback, useMemo, useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useDictationAudio } from "../../../hooks/useDictationAudio";
import { useDictationPractice } from "../../../hooks/useDictationPractice";
import { DictationAudioPlayer } from "../../blocks/DictationAudioPlayer";
import { DictationDiffResult } from "../../blocks/DictationDiffResult";
import { DictationHintDrawer } from "../../blocks/DictationHintDrawer";
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
};

export function DictationPracticeView({
  lessonId,
}: DictationPracticeViewProps) {
  const router = useRouter();
  const { isVi } = useLanguage();
  const [hintDrawerOpen, setHintDrawerOpen] = useState(false);

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
   * Chấm một câu. Trả về null khi gọi hỏng, và hook sẽ không ghi kết quả -
   * thà không có gì còn hơn ghi một con số tự bịa ở client.
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

  const practice = useDictationPractice(
    lesson ?? EMPTY_LESSON,
    sentences,
    checkSentence,
  );

  const audio = useDictationAudio({
    audioUrl: practice.currentSentence?.audioUrl ?? null,
    durationSeconds: practice.currentSentence
      ? practice.currentSentence.audioDurationSeconds
      : 5,
    audioStartMs: practice.currentSentence?.audioStartMs,
    audioEndMs: practice.currentSentence?.audioEndMs,
  });

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
            label: isVi ? "Về thư viện bài nghe" : "Back to lessons",
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
          summary={{
            ...practice.summaryData,
            metrics: {
              ...practice.summaryData.metrics,
              replays: audio.replayCount,
            },
          }}
          onRestart={() => {
            practice.restartPractice();
            audio.resetReplayCount();
          }}
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
        {practice.submitError && (
          <Alert color="red" role="alert">
            {isVi
              ? "Chưa lưu được câu trả lời. Nội dung bạn nhập vẫn được giữ; hãy kiểm tra kết nối và thử lại."
              : "Your answer could not be saved. Your text is kept; check your connection and try again."}
          </Alert>
        )}
        {audio.error && (
          <Alert color="red" role="alert">
            {isVi
              ? "Không phát được âm thanh. Thử phát lại hoặc tải lại bài nghe."
              : "Audio is unavailable. Try playing again or reload the lesson."}
          </Alert>
        )}
        {practice.submitting && (
          <Text role="status">{isVi ? "Đang kiểm tra…" : "Checking…"}</Text>
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
                {isVi ? "Trở về Thư viện" : "Back to Library"}
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
                {isVi
                  ? `Câu ${practice.currentIndex + 1} / ${practice.totalSentences}`
                  : `Sentence ${practice.currentIndex + 1} / ${practice.totalSentences}`}
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
          onTogglePlay={audio.togglePlay}
          onReplay={audio.replay}
          onBack5={audio.back5}
          onForward5={audio.forward5}
          onChangeSpeed={audio.changeSpeed}
        />

        {/* Hint Drawer */}
        <DictationHintDrawer
          sentence={practice.currentSentence}
          hintsUsedCount={practice.hintsUsedCount}
          revealedHints={practice.revealedHints}
          onRevealHint={practice.revealHint}
          isOpen={hintDrawerOpen}
          onToggle={() => setHintDrawerOpen((prev) => !prev)}
        />

        {/* Typing Input Area */}
        <DictationInputArea
          value={practice.typedText}
          onChange={practice.handleType}
          onCheckAnswer={practice.checkAnswer}
          onSkip={practice.skipSentence}
          disabled={
            practice.isChecked || practice.submitting || sentences.length === 0
          }
        />

        {/* Checked Result Diff */}
        {practice.isChecked && practice.diffResult && (
          <DictationDiffResult
            diff={practice.diffResult}
            expectedSentence={practice.currentCorrectText}
            onNextSentence={practice.nextSentence}
            onTryAgain={practice.retrySentence}
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
