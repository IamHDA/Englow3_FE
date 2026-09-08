"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  FastForward,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { DEFAULT_WAVEFORM_BARS } from "../../../constants/dictationData";

interface DictationAudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  replayCount: number;
  onTogglePlay: () => void;
  onReplay: () => void;
  onBack5: () => void;
  onForward5: () => void;
  onChangeSpeed: (speed: number) => void;
}

export function DictationAudioPlayer({
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  replayCount,
  onTogglePlay,
  onReplay,
  onBack5,
  onForward5,
  onChangeSpeed,
}: DictationAudioPlayerProps) {
  const { isVi } = useLanguage();
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const activeBarIndex = Math.floor(progressRatio * DEFAULT_WAVEFORM_BARS.length);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const speeds = [0.5, 0.75, 1.0, 1.25];

  return (
    <Paper radius="md" p="lg" withBorder bg="white">
      <Stack gap="md">
        {/* Waveform Visualization */}
        <Group
          justify="center"
          align="flex-end"
          gap={3}
          style={{
            height: 52,
            padding: "0 8px",
            overflow: "hidden",
          }}
        >
          {DEFAULT_WAVEFORM_BARS.map((height, i) => {
            const isFilled = i <= activeBarIndex;
            return (
              <div
                key={i}
                style={{
                  width: 4,
                  height: `${height}px`,
                  borderRadius: 2,
                  backgroundColor: isFilled
                    ? "var(--mantine-color-navy-9)"
                    : "var(--mantine-color-navy-2)",
                  transition: "background-color 0.1s ease, height 0.2s ease",
                }}
              />
            );
          })}
        </Group>

        {/* Player Transport Bar */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align="center"
          gap="md"
        >
          <Group gap="xs">
            <Text fw={600} size="sm" c="ink.8">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
            {replayCount > 0 && (
              <Badge variant="light" color="orange" size="sm" radius="sm">
                {isVi ? `Đã nghe lại: ${replayCount} lần` : `Replays: ${replayCount}`}
              </Badge>
            )}
          </Group>

          {/* Center Transport Controls */}
          <Group gap="sm" align="center">
            <ActionIcon
              variant="default"
              size="lg"
              radius="xl"
              onClick={onBack5}
              title={isVi ? "Lùi lại 5 giây" : "Back 5 seconds"}
              aria-label={isVi ? "Lùi lại 5 giây" : "Back 5 seconds"}
            >
              <RotateCcw size={16} />
            </ActionIcon>

            <ActionIcon
              variant="filled"
              color="navy"
              size={52}
              radius="xl"
              onClick={onTogglePlay}
              title={isPlaying ? (isVi ? "Tạm dừng" : "Pause") : (isVi ? "Phát âm thanh" : "Play audio")}
              aria-label={isPlaying ? (isVi ? "Tạm dừng" : "Pause") : (isVi ? "Phát âm thanh" : "Play audio")}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 2 }} />}
            </ActionIcon>

            <ActionIcon
              variant="default"
              size="lg"
              radius="xl"
              onClick={onReplay}
              title={isVi ? "Nghe lại câu này" : "Replay sentence"}
              aria-label={isVi ? "Nghe lại câu này" : "Replay sentence"}
            >
              <RotateCw size={16} />
            </ActionIcon>

            <ActionIcon
              variant="default"
              size="lg"
              radius="xl"
              onClick={onForward5}
              title={isVi ? "Tua tới 5 giây" : "Forward 5 seconds"}
              aria-label={isVi ? "Tua tới 5 giây" : "Forward 5 seconds"}
            >
              <FastForward size={16} />
            </ActionIcon>
          </Group>

          {/* Playback Speed Controls */}
          <Group gap={4} align="center">
            <Text size="xs" c="ink.6" fw={500} mr={2}>
              {isVi ? "Tốc độ:" : "Speed:"}
            </Text>
            {speeds.map((s) => (
              <Button
                key={s}
                variant={playbackSpeed === s ? "filled" : "subtle"}
                color={playbackSpeed === s ? "navy" : "gray"}
                size="compact-xs"
                radius="sm"
                onClick={() => onChangeSpeed(s)}
                fw={600}
              >
                {s}x
              </Button>
            ))}
          </Group>
        </Flex>
      </Stack>
    </Paper>
  );
}
