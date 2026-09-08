"use client";

import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useVoiceRecorder } from "../../../hooks/useVoiceRecorder";
import { PronunciationLesson } from "../../../types";
import { PronunciationScoreCard } from "../../blocks/PronunciationScoreCard";
import { PronunciationVoiceRecorder } from "../../blocks/PronunciationVoiceRecorder";

interface PronunciationPracticeViewProps {
  lesson: PronunciationLesson;
}

export function PronunciationPracticeView({ lesson }: PronunciationPracticeViewProps) {
  const { isVi } = useLanguage();
  const {
    isRecording,
    isProcessing,
    recordingDuration,
    audioBlobUrl,
    evaluation,
    waveformLevels,
    playNativeAudio,
    startRecording,
    stopRecording,
    resetPractice,
  } = useVoiceRecorder({ lesson });

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Navigation & Header */}
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href="/study/pronunciation"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
          >
            {isVi ? "Quay lại thư viện phát âm" : "Back to Pronunciation Library"}
          </Button>

          <Stack gap={2} align="center">
            <Text fw={700} fz="sm" c="dark.9">
              {lesson.title}
            </Text>
            <Badge variant="light" color="indigo" size="xs">
              {lesson.category}
            </Badge>
          </Stack>

          <Box style={{ width: 140 }} />
        </Group>

        {/* Voice Recorder Block */}
        <PronunciationVoiceRecorder
          lesson={lesson}
          isRecording={isRecording}
          isProcessing={isProcessing}
          recordingDuration={recordingDuration}
          waveformLevels={waveformLevels}
          audioBlobUrl={audioBlobUrl}
          onPlayNative={playNativeAudio}
          onStartRecord={startRecording}
          onStopRecord={stopRecording}
        />

        {/* Score Card when evaluated */}
        {evaluation && (
          <PronunciationScoreCard
            evaluation={evaluation}
            onRetry={resetPractice}
          />
        )}
      </Stack>
    </Container>
  );
}
