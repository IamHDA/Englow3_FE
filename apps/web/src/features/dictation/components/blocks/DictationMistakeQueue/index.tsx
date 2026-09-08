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
import { computeWordDiff } from "../../../utils/diff";
import type { MistakeReviewItem } from "../../../types";
import { DictationAudioPlayer } from "../DictationAudioPlayer";
import { DictationInputArea } from "../DictationInputArea";
import { useDictationAudio } from "../../../hooks/useDictationAudio";

interface DictationMistakeQueueProps {
  mistakes: MistakeReviewItem[];
  lessonTitle: string;
}

export function DictationMistakeQueue({
  mistakes,
  lessonTitle,
}: DictationMistakeQueueProps) {
  const { isVi } = useLanguage();
  const [queue, setQueue] = useState<MistakeReviewItem[]>(mistakes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentItem = queue[currentIndex];

  const audio = useDictationAudio({
    textToSpeak: currentItem ? currentItem.correctAnswer : "",
    durationSeconds: currentItem ? currentItem.audioDurationSeconds : 5,
  });

  const handleCheck = () => {
    if (!currentItem) return;
    const diff = computeWordDiff(currentItem.correctAnswer, inputVal);
    const correct = diff.accuracyPercent === 100;
    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      // Remove from queue after a short delay or allow next
    }
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
    setInputVal("");
    setIsChecked(false);
    setIsCorrect(false);
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => (prev + 1) % queue.length);
    setInputVal("");
    setIsChecked(false);
    setIsCorrect(false);
  };

  if (queue.length === 0) {
    return (
      <Paper radius="lg" p="xl" withBorder bg="white" style={{ textAlign: "center" }}>
        <Stack align="center" gap="md" py="xl">
          <ThemeIcon size={64} radius="xl" color="teal" variant="light">
            <Trophy size={36} />
          </ThemeIcon>
          <Title order={2} size="h3" fw={700} c="ink.9">
            {isVi ? "Xuất sắc! Bạn đã vượt qua tất cả câu sai!" : "Great job! You cleared all mistakes!"}
          </Title>
          <Text size="sm" c="ink.6" style={{ maxWidth: 460 }}>
            {isVi
              ? `Tất cả các câu trong danh sách lỗi của bài “${lessonTitle}” đã được bạn nghe và gõ lại chuẩn xác 100%.`
              : `All sentences from the mistakes queue of "${lessonTitle}" have been typed with 100% accuracy.`}
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
                • {isVi ? `${queue.length} câu cần ôn tập trong danh sách` : `${queue.length} sentences to review in queue`}
              </Text>
            </Group>

            <Text size="xs" fw={600} c="ink.7">
              {isVi ? `Câu ${currentIndex + 1} / ${queue.length}` : `Sentence ${currentIndex + 1} / ${queue.length}`}
            </Text>
          </Group>

          {/* Queue Pills */}
          <Group gap="xs" wrap="wrap">
            {queue.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <Button
                  key={item.id}
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
                  {isVi ? `Câu ${item.sentenceNumber}` : `Sentence ${item.sentenceNumber}`}
                </Button>
              );
            })}
          </Group>
        </Stack>
      </Paper>

      {/* Previous Attempt Note Banner */}
      <Alert
        icon={<AlertCircle size={18} />}
        title={isVi ? `Sai lần trước · Độ chính xác ${currentItem.previousAccuracy}%` : `Previous mistake · Accuracy ${currentItem.previousAccuracy}%`}
        color="orange"
        radius="md"
      >
        <Text size="xs" mb={4}>
          {isVi ? "Nghe lại và gõ đúng để gỡ câu này khỏi danh sách câu sai." : "Listen and type accurately to clear this sentence from mistakes."}
        </Text>
        <Text size="xs" fw={500} c="ink.8">
          {currentItem.explanation}
        </Text>
        {isChecked && (
          <Text size="xs" fw={600} c="teal.9" mt="xs">
            {isVi ? `Đáp án chuẩn: “${currentItem.correctAnswer}”` : `Correct answer: "${currentItem.correctAnswer}"`}
          </Text>
        )}
      </Alert>

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
        onCheckAnswer={handleCheck}
        onSkip={handleSkip}
        disabled={isChecked}
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
                {isCorrect ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
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
