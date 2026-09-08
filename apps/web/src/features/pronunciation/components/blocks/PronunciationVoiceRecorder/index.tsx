"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconMicrophone,
  IconPlayerPlay,
  IconPlayerStop,
  IconVolume,
  IconVolume2,
} from "@tabler/icons-react";
import React from "react";
import { PronunciationLesson } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface PronunciationVoiceRecorderProps {
  lesson: PronunciationLesson;
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;
  waveformLevels: number[];
  audioBlobUrl: string | null;
  onPlayNative: (slow?: boolean) => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
}

export function PronunciationVoiceRecorder({
  lesson,
  isRecording,
  isProcessing,
  recordingDuration,
  waveformLevels,
  audioBlobUrl,
  onPlayNative,
  onStartRecord,
  onStopRecord,
}: PronunciationVoiceRecorderProps) {
  const { isVi } = useLanguage();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Card withBorder padding="xl" radius="lg" shadow="sm">
      <Stack gap="lg" align="center">
        {/* Top Badges */}
        <Group justify="space-between" w="100%">
          <Badge variant="light" color="indigo" size="md">
            {isVi ? "Mục tiêu:" : "Focus:"} {lesson.phonemeTarget}
          </Badge>
          <Badge variant="dot" color="teal" size="sm">
            {isVi ? "Nhận diện giọng nói AI" : "AI Speech Recognition Active"}
          </Badge>
        </Group>

        {/* Target Sentence Display */}
        <Stack align="center" gap="xs" maw={700}>
          <Text
            fz={{ base: 24, sm: 30 }}
            fw={800}
            ta="center"
            c="dark.9"
            style={{ letterSpacing: "-0.01em", lineHeight: 1.3 }}
          >
            &ldquo;{lesson.targetSentence}&rdquo;
          </Text>

          <Text fz="md" c="indigo.7" fs="italic" ta="center">
            {lesson.ipaTranscript}
          </Text>

          <Box
            p="xs"
            px="md"
            style={{
              backgroundColor: "var(--mantine-color-gray-0)",
              borderRadius: "var(--mantine-radius-md)",
            }}
          >
            <Text fz="xs" c="dimmed" ta="center">
              {isVi ? "Ý nghĩa:" : "Meaning:"} <b>{lesson.translationVi}</b>
            </Text>
          </Box>
        </Stack>

        {/* Native Speaker Audio Reference Controls */}
        <Group justify="center" gap="md">
          <Button
            variant="light"
            color="indigo"
            radius="xl"
            size="sm"
            onClick={() => onPlayNative(false)}
            leftSection={<IconVolume size={18} />}
          >
            {isVi ? "Nghe mẫu chuẩn (1.0x)" : "Native Audio (1.0x)"}
          </Button>

          <Button
            variant="subtle"
            color="indigo"
            radius="xl"
            size="sm"
            onClick={() => onPlayNative(true)}
            leftSection={<IconVolume2 size={16} />}
          >
            {isVi ? "Nghe chậm (0.75x)" : "Slow Audio (0.75x)"}
          </Button>
        </Group>

        <Divider w="100%" my="xs" />

        {/* Live Audio Waveform Visualizer */}
        <Box
          h={60}
          w="100%"
          maw={460}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {waveformLevels.map((lvl, idx) => (
            <Box
              key={idx}
              w={6}
              h={isRecording ? `${lvl}%` : 8}
              bg={isRecording ? "indigo.6" : "gray.3"}
              style={{
                borderRadius: 4,
                transition: "height 0.1s ease",
              }}
            />
          ))}
        </Box>

        {/* Big Record Action Button */}
        <Stack align="center" gap="xs">
          {isProcessing ? (
            <Stack align="center" gap="xs" py="md">
              <Loader size="md" color="indigo" />
              <Text fz="sm" fw={600} c="indigo">
                {isVi
                  ? "AI đang xử lý và phân tích âm vị của bạn..."
                  : "AI analyzing articulation and phonemes..."}
              </Text>
            </Stack>
          ) : isRecording ? (
            <>
              <ActionIcon
                size={80}
                radius="xl"
                color="red"
                variant="filled"
                onClick={onStopRecord}
                style={{
                  boxShadow: "0 0 0 10px rgba(239, 68, 68, 0.2)",
                  animation: "pulse 1.5s infinite",
                  cursor: "pointer",
                }}
                aria-label={isVi ? "Dừng ghi âm" : "Stop recording"}
              >
                <IconPlayerStop size={38} />
              </ActionIcon>
              <Text fz="sm" fw={700} c="red.7">
                {isVi
                  ? `Đang ghi âm (${formatTimer(recordingDuration)}) - Bấm để dừng`
                  : `Recording (${formatTimer(recordingDuration)}) - Tap to stop`}
              </Text>
            </>
          ) : (
            <>
              <ActionIcon
                data-testid="mic-record-btn"
                size={80}
                radius="xl"
                color="indigo"
                variant="filled"
                onClick={onStartRecord}
                style={{
                  boxShadow: "0 8px 24px -4px rgba(79, 70, 229, 0.35)",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
                aria-label={isVi ? "Bắt đầu ghi âm" : "Start recording"}
              >
                <IconMicrophone size={38} />
              </ActionIcon>
              <Text fz="xs" fw={600} c="dimmed">
                {isVi
                  ? "Bấm vào micro và đọc to câu văn phía trên"
                  : "Tap microphone and read the sentence aloud"}
              </Text>
            </>
          )}
        </Stack>

        {/* User Recorded Playback if available */}
        {audioBlobUrl && !isRecording && !isProcessing && (
          <Group
            justify="center"
            gap="xs"
            p="xs"
            style={{
              borderRadius: "var(--mantine-radius-md)",
              backgroundColor: "var(--mantine-color-teal-0)",
            }}
          >
            <ThemeIcon variant="filled" color="teal" size="sm" radius="xl">
              <IconPlayerPlay size={12} />
            </ThemeIcon>
            <Text fz="xs" fw={700} c="teal.9">
              {isVi ? "Bản ghi âm của bạn đã sẵn sàng:" : "Your recording is ready:"}
            </Text>
            <audio src={audioBlobUrl} controls style={{ height: 32 }} />
          </Group>
        )}
      </Stack>
    </Card>
  );
}
