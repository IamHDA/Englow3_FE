"use client";

import {
  Alert,
  Badge,
  Button,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { DictationSubmission, MistakeSentence } from "../../../types";
import { DictationAudioPlayer } from "../DictationAudioPlayer";
import { DictationInputArea } from "../DictationInputArea";
import { useDictationAudio } from "../../../hooks/useDictationAudio";

interface DictationMistakeQueueProps {
  mistakes: MistakeSentence[];
  /**
   * Chấm một câu trên server. Block không tự gọi - view giữ ranh giới dữ liệu.
   * Null nghĩa là gọi hỏng.
   */
  onCheck: (
    sentenceId: string,
    typed: string,
  ) => Promise<DictationSubmission | null>;
}

export function DictationMistakeQueue({
  mistakes,
  onCheck,
}: DictationMistakeQueueProps) {
  const { isVi } = useLanguage();
  const [queue, setQueue] = useState<MistakeSentence[]>(mistakes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [result, setResult] = useState<DictationSubmission | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);

  const currentItem = queue[currentIndex];

  // Phát đúng bản ghi của câu đó. Trước đây chỗ này truyền null vì chưa có
  // endpoint trả URL - giờ có rồi, nên không còn phải đọc transcript bằng giọng
  // tổng hợp (cách đó sẽ phải đưa đáp án xuống client trước khi người học gõ).
  const audio = useDictationAudio({
    audioUrl: currentItem ? currentItem.audioUrl : null,
    durationSeconds: currentItem ? currentItem.audioDurationSeconds : 5,
    // Câu cắt ra từ một bản ghi dài: phát đúng đoạn của nó, không phải cả bài.
    audioStartMs: currentItem?.audioStartMs,
    audioEndMs: currentItem?.audioEndMs,
  });

  const handleCheck = async () => {
    if (!currentItem || checking) return;
    setChecking(true);
    setCheckFailed(false);
    const submitted = await onCheck(currentItem.sentenceId, inputVal);
    setChecking(false);

    if (!submitted) {
      // Không chấm được thì nói thế, không đoán. Người học gõ lại được ngay.
      setCheckFailed(true);
      return;
    }
    setResult(submitted);
    // "Đạt" theo đúng một quy tắc của server. Trước đây chỗ này đòi 100%,
    // trong khi mọi màn khác tính 80% là xong.
    setIsCorrect(submitted.cleared);
    setIsChecked(true);
  };

  const handleNext = () => {
    if (isCorrect) {
      // remove current item
      const newQueue = queue.filter((_, idx) => idx !== currentIndex);
      setQueue(newQueue);
      if (currentIndex >= newQueue.length) {
        setCurrentIndex(Math.max(0, newQueue.length - 1));
      }
    } else {
      setCurrentIndex((prev) => (prev + 1) % queue.length);
    }
    resetTurn();
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => (prev + 1) % queue.length);
    resetTurn();
  };

  function resetTurn() {
    setInputVal("");
    setIsChecked(false);
    setIsCorrect(false);
    setResult(null);
    setCheckFailed(false);
  }

  if (queue.length === 0) {
    return (
      <Paper
        radius="lg"
        p="xl"
        withBorder
        bg="white"
        style={{ textAlign: "center" }}
      >
        <Stack align="center" gap="md" py="xl">
          <ThemeIcon size={64} radius="xl" color="teal" variant="light">
            <Trophy size={36} />
          </ThemeIcon>
          <Title order={2} size="h3" fw={700} c="ink.9">
            {isVi
              ? "Xuất sắc! Bạn đã vượt qua tất cả câu sai!"
              : "Great job! You cleared all mistakes!"}
          </Title>
          <Text size="sm" c="ink.6" style={{ maxWidth: 460 }}>
            {isVi
              ? "Không còn câu nào bạn hay sai. Cứ luyện tiếp, danh sách này sẽ tự cập nhật."
              : "No sentences are giving you trouble. Keep practising and this list will fill itself."}
          </Text>
          <Group gap="sm" mt="md">
            <Button
              component={Link}
              href="/study/dictation"
              variant="filled"
              color="navy"
              radius="md"
              leftSection={<ArrowLeft size={16} />}
            >
              {isVi ? "Quay lại thư viện bài học" : "Back to lessons"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {/* Header Queue Banner */}
      <Paper radius="md" p="md" withBorder bg="white">
        <Stack gap="xs">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="xs">
              <Badge color="orange" variant="light" size="sm">
                {isVi ? "Luyện tập câu sai" : "Mistake Practice"}
              </Badge>
              <Text size="xs" c="ink.5">
                •{" "}
                {isVi
                  ? `${queue.length} câu cần ôn tập trong danh sách`
                  : `${queue.length} sentences to review in queue`}
              </Text>
            </Group>

            <Text size="xs" fw={600} c="ink.7">
              {isVi
                ? `Câu ${currentIndex + 1} / ${queue.length}`
                : `Sentence ${currentIndex + 1} / ${queue.length}`}
            </Text>
          </Group>

          {/* Queue Pills */}
          <Group gap="xs" wrap="wrap">
            {queue.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <Button
                  key={item.sentenceId}
                  size="compact-xs"
                  variant={isActive ? "filled" : "light"}
                  color={isActive ? "orange" : "gray"}
                  radius="xl"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setInputVal("");
                    setIsChecked(false);
                  }}
                  fw={600}
                >
                  {item.lessonTitle}
                </Button>
              );
            })}
          </Group>
        </Stack>
      </Paper>

      {/* Previous Attempt Note Banner */}
      <Alert
        icon={<AlertCircle size={18} />}
        title={
          isVi
            ? `Tốt nhất ${currentItem.bestAccuracyPercent}% sau ${currentItem.attemptCount} lần thử`
            : `Best ${currentItem.bestAccuracyPercent}% over ${currentItem.attemptCount} attempts`
        }
        color="orange"
        radius="md"
      >
        <Text size="xs" mb={4}>
          {isVi
            ? "Nghe lại và gõ đúng để gỡ câu này khỏi danh sách câu sai."
            : "Listen and type accurately to clear this sentence from mistakes."}
        </Text>
        {currentItem.lastResponse !== null && (
          <Text size="xs" fw={500} c="ink.8">
            {isVi ? "Lần trước bạn gõ: " : "Last time you typed: "}
            <Text span fs="italic">
              &ldquo;{currentItem.lastResponse}&rdquo;
            </Text>
          </Text>
        )}
        {/* Đáp án chỉ có sau khi nộp - nó tới trong kết quả chấm, không nằm
            sẵn trong danh sách. */}
        {isChecked && result && (
          <Text size="xs" fw={600} c="teal.9" mt="xs">
            {isVi
              ? `Đáp án chuẩn: “${result.correctText}” (${Math.round(result.accuracyPercent)}%)`
              : `Correct answer: "${result.correctText}" (${Math.round(result.accuracyPercent)}%)`}
          </Text>
        )}
      </Alert>

      {checkFailed && (
        <Alert color="warn" radius="md">
          <Text size="sm">
            {isVi
              ? "Chưa chấm được câu này. Kiểm tra kết nối rồi bấm kiểm tra lại."
              : "Could not check this one. Check your connection and try again."}
          </Text>
        </Alert>
      )}

      {/* Audio Player */}
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

      {/* Input Area */}
      <DictationInputArea
        value={inputVal}
        onChange={setInputVal}
        onCheckAnswer={() => void handleCheck()}
        onSkip={handleSkip}
        disabled={isChecked || checking}
      />

      {/* Checked Result Feedback */}
      {isChecked && (
        <Paper radius="md" p="md" withBorder bg="white">
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align="center"
            gap="sm"
          >
            <Group gap="xs">
              <ThemeIcon
                size={32}
                radius="xl"
                color={isCorrect ? "teal" : "warn"}
                variant="light"
              >
                {isCorrect ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
              </ThemeIcon>
              <Text size="sm" fw={600} c={isCorrect ? "teal.9" : "warn.9"}>
                {isCorrect
                  ? isVi
                    ? "Chính xác! Câu này sẽ được gỡ khỏi danh sách lỗi."
                    : "Correct! This sentence has been cleared from mistakes."
                  : isVi
                    ? "Chưa hoàn toàn chính xác. Hãy nghe lại lần nữa nhé!"
                    : "Not quite right. Please listen and try again!"}
              </Text>
            </Group>

            <Button
              variant="filled"
              color={isCorrect ? "teal" : "navy"}
              size="sm"
              radius="md"
              onClick={handleNext}
              rightSection={<ArrowRight size={15} />}
              fw={600}
            >
              {isCorrect
                ? isVi
                  ? "Tiếp tục gỡ câu tiếp theo"
                  : "Continue to next sentence"
                : isVi
                  ? "Thử lại câu tiếp theo"
                  : "Try next sentence"}
            </Button>
          </Flex>
        </Paper>
      )}
    </Stack>
  );
}
