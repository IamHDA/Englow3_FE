"use client";

import {
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useDictationAudio } from "../../../hooks/useDictationAudio";
import { useDictationPractice } from "../../../hooks/useDictationPractice";
import type { DictationLesson } from "../../../types";
import { DictationAudioPlayer } from "../../blocks/DictationAudioPlayer";
import { DictationDiffResult } from "../../blocks/DictationDiffResult";
import { DictationHintDrawer } from "../../blocks/DictationHintDrawer";
import { DictationInputArea } from "../../blocks/DictationInputArea";
import { DictationSessionSummary } from "../../blocks/DictationSessionSummary";

interface DictationPracticeViewProps {
  lesson: DictationLesson;
}

export function DictationPracticeView({ lesson }: DictationPracticeViewProps) {
  const router = useRouter();
  const { isVi } = useLanguage();
  const [hintDrawerOpen, setHintDrawerOpen] = useState(false);

  const practice = useDictationPractice(lesson);

  const audio = useDictationAudio({
    textToSpeak: practice.currentSentence ? practice.currentSentence.text : "",
    durationSeconds: practice.currentSentence
      ? practice.currentSentence.audioDurationSeconds
      : 5,
  });

  if (practice.isCompleted) {
    return (
      <Container size="md" py="xl">
        <DictationSessionSummary
          summary={practice.summaryData}
          onRestart={practice.restartPractice}
          onReviewMistakes={() => {
            router.push(`/study/dictation/${lesson.slug || lesson.id}/review`);
          }}
        />
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
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
                {lesson.level}
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
          disabled={practice.isChecked}
        />

        {/* Checked Result Diff */}
        {practice.isChecked && practice.diffResult && (
          <DictationDiffResult
            diff={practice.diffResult}
            expectedSentence={practice.currentSentence.text}
            onNextSentence={practice.nextSentence}
            onTryAgain={() => {
              // Allows user to try typing again
              practice.handleType("");
            }}
            onListenAgain={audio.replay}
            isLastSentence={practice.currentIndex + 1 >= practice.totalSentences}
          />
        )}
      </Stack>
    </Container>
  );
}
