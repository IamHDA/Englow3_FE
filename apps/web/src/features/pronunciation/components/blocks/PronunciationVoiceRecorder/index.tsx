"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  List,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconMicrophone,
  IconPlayerStop,
  IconVolume,
  IconVolume2,
} from "@tabler/icons-react";
import React from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import type { PracticePhase } from "../../../hooks/useSpeakingPractice";
import type { SpeakingPrompt } from "../../../types";

interface PronunciationVoiceRecorderProps {
  prompt: SpeakingPrompt;
  phase: PracticePhase;
  recordingSeconds: number;
  /** Bản ghi vừa tạo trong trình duyệt, nghe lại được ngay trước khi có điểm. */
  localAudioUrl: string | null;
  onPlayReference: (slow?: boolean) => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
}

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PronunciationVoiceRecorder({
  prompt,
  phase,
  recordingSeconds,
  localAudioUrl,
  onPlayReference,
  onStartRecord,
  onStopRecord,
}: PronunciationVoiceRecorderProps) {
  const { isVi } = useLanguage();
  const isRecording = phase === "recording";
  const isBusy = phase === "uploading" || phase === "assessing";

  const busyLabel =
    phase === "uploading"
      ? isVi
        ? "Đang tải bản ghi lên..."
        : "Uploading your recording..."
      : isVi
        ? "Đang chấm..."
        : "Scoring...";

  return (
    <Card withBorder padding="xl" radius="lg">
      <Stack gap="lg">
        <Stack gap={6}>
          <Group gap="xs">
            <Text fz="xs" fw={700} c="dimmed">
              {isVi ? "ĐỌC CÂU NÀY" : "SAY THIS"}
            </Text>
            {prompt.phonemeTarget !== null && (
              <Badge variant="light" color="indigo" size="xs">
                {prompt.phonemeTarget}
              </Badge>
            )}
          </Group>

          <Text fw={700} fz="xl" c="dark.9" lh={1.4}>
            {prompt.referenceText}
          </Text>

          {prompt.ipaTranscript !== null && (
            <Text fz="sm" c="indigo.7">
              {prompt.ipaTranscript}
            </Text>
          )}
          {prompt.translationVi !== null && (
            <Text fz="xs" c="dimmed">
              {prompt.translationVi}
            </Text>
          )}
        </Stack>

        {/* Giọng tổng hợp của trình duyệt, không phải bản thu của người bản ngữ. */}
        <Group gap="xs">
          <Button
            variant="light"
            color="indigo"
            size="xs"
            radius="md"
            leftSection={<IconVolume size={16} />}
            onClick={() => onPlayReference(false)}
          >
            {isVi ? "Nghe câu mẫu" : "Hear it"}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            radius="md"
            leftSection={<IconVolume2 size={16} />}
            onClick={() => onPlayReference(true)}
          >
            {isVi ? "Nghe chậm" : "Slowly"}
          </Button>
        </Group>

        {prompt.tips.length > 0 && (
          <Box
            p="sm"
            bg="var(--mantine-color-indigo-0)"
            style={{ borderRadius: 8 }}
          >
            <Text fz="xs" fw={700} c="indigo.8" mb={4}>
              {isVi ? "Mẹo phát âm" : "Tips"}
            </Text>
            <List size="xs" spacing={4} c="indigo.9">
              {prompt.tips.map((tip) => (
                <List.Item key={tip}>{tip}</List.Item>
              ))}
            </List>
          </Box>
        )}

        <Divider />

        <Stack gap="sm" align="center">
          {isRecording && (
            <Badge color="red" variant="light" size="lg" radius="sm">
              {isVi ? "Đang ghi" : "Recording"} ·{" "}
              {formatSeconds(recordingSeconds)}
            </Badge>
          )}

          {isBusy ? (
            <Group gap="xs">
              <Loader size="sm" />
              <Text fz="sm" c="dimmed">
                {busyLabel}
              </Text>
            </Group>
          ) : (
            <Button
              size="lg"
              radius="xl"
              color={isRecording ? "red" : "indigo"}
              leftSection={
                isRecording ? (
                  <IconPlayerStop size={20} />
                ) : (
                  <IconMicrophone size={20} />
                )
              }
              onClick={isRecording ? onStopRecord : onStartRecord}
            >
              {isRecording
                ? isVi
                  ? "Dừng và chấm"
                  : "Stop and score"
                : isVi
                  ? "Bắt đầu ghi âm"
                  : "Start recording"}
            </Button>
          )}

          {localAudioUrl !== null && !isRecording && (
            <Stack gap={4} align="center">
              <Text fz="xs" c="dimmed">
                {isVi ? "Nghe lại bản vừa ghi" : "Play back what you recorded"}
              </Text>
              <audio controls src={localAudioUrl}>
                {isVi ? "Bản ghi của bạn" : "Your recording"}
              </audio>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
