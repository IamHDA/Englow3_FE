"use client";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconRotateClockwise } from "@tabler/icons-react";
import React from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import type { SpeakingAttempt, SpeakingWord } from "../../../types";

interface PronunciationScoreCardProps {
  attempt: SpeakingAttempt;
  onRetry: () => void;
}

function scoreColor(score: number): string {
  if (score >= 85) return "teal";
  if (score >= 70) return "blue";
  if (score >= 55) return "orange";
  return "red";
}

/**
 * Điểm chưa đo được thì hiện gạch ngang, không hiện 0.
 *
 * Nhà cung cấp bỏ trống những gì nó không đo - prosody nếu không yêu cầu, và
 * accuracy khi bản ghi không có tiếng nói. Viết 0/100 vào đó là báo người học
 * trượt một phép đo chưa từng chạy.
 */
function ScoreTile({ label, value }: { label: string; value: number | null }) {
  return (
    <Card withBorder padding="sm" radius="md">
      <Stack gap={2} align="center">
        <Text
          fz={22}
          fw={800}
          c={value === null ? "dimmed" : scoreColor(value)}
        >
          {value === null ? "—" : Math.round(value)}
        </Text>
        <Text fz="xs" c="dimmed" ta="center">
          {label}
        </Text>
      </Stack>
    </Card>
  );
}

/** Màu theo điểm của từng từ; từ không có điểm để nguyên màu chữ thường. */
function WordChip({ word }: { word: SpeakingWord }) {
  const { isVi } = useLanguage();
  const accuracy = word.accuracyPercent;
  const phonemes = word.phonemes
    .map(
      (phoneme) =>
        `${phoneme.phoneme}${phoneme.accuracy === null ? "" : ` ${Math.round(phoneme.accuracy)}`}`,
    )
    .join("  ");

  const label =
    phonemes === ""
      ? isVi
        ? "Không có chi tiết âm vị"
        : "No phoneme detail"
      : phonemes;

  return (
    <Tooltip label={label} withArrow multiline maw={280}>
      <Badge
        variant="light"
        size="lg"
        radius="sm"
        color={accuracy === null ? "gray" : scoreColor(accuracy)}
        style={{ textTransform: "none", cursor: "default" }}
      >
        {word.word}
        {accuracy !== null && ` ${Math.round(accuracy)}`}
      </Badge>
    </Tooltip>
  );
}

export function PronunciationScoreCard({
  attempt,
  onRetry,
}: PronunciationScoreCardProps) {
  const { isVi } = useLanguage();
  const overall = attempt.pronunciationPercent;

  return (
    <Card withBorder padding="xl" radius="lg" shadow="sm">
      <Stack gap="lg">
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="md">
            <RingProgress
              size={96}
              thickness={9}
              roundCaps
              sections={[
                {
                  value: overall ?? 0,
                  color: overall === null ? "gray.3" : scoreColor(overall),
                },
              ]}
              label={
                <Text ta="center" fw={800} fz="lg">
                  {overall === null ? "—" : Math.round(overall)}
                </Text>
              }
            />
            <Stack gap={2}>
              <Text fw={800} fz="lg" c="dark.9">
                {isVi ? "Điểm phát âm" : "Pronunciation score"}
              </Text>
              <Text fz="xs" c="dimmed" maw={360}>
                {isVi
                  ? "Chấm bằng cách so bản ghi của bạn với câu mẫu, không phải bằng cảm tính."
                  : "Scored by comparing your recording against the sentence, not by opinion."}
              </Text>
            </Stack>
          </Group>

          <Button
            variant="light"
            color="indigo"
            radius="md"
            leftSection={<IconRotateClockwise size={16} />}
            onClick={onRetry}
          >
            {isVi ? "Ghi lại" : "Record again"}
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <ScoreTile
            label={isVi ? "Chính xác" : "Accuracy"}
            value={attempt.accuracyPercent}
          />
          <ScoreTile
            label={isVi ? "Trôi chảy" : "Fluency"}
            value={attempt.fluencyPercent}
          />
          <ScoreTile
            label={isVi ? "Đầy đủ" : "Completeness"}
            value={attempt.completenessPercent}
          />
          <ScoreTile
            label={isVi ? "Ngữ điệu" : "Prosody"}
            value={attempt.prosodyPercent}
          />
        </SimpleGrid>

        {/*
          Máy nghe được gì, đặt cạnh câu phải đọc. Đây thường là manh mối rõ
          nhất: "seat" thành "sit" nói được nhiều hơn bất cứ con số nào.
        */}
        <Stack gap={6}>
          <Text fz="xs" fw={700} c="dimmed">
            {isVi ? "CÂU MẪU" : "REFERENCE"}
          </Text>
          <Text fz="sm" c="dark.8">
            {attempt.referenceText}
          </Text>

          <Text fz="xs" fw={700} c="dimmed" mt="xs">
            {isVi ? "MÁY NGHE ĐƯỢC" : "WHAT WAS HEARD"}
          </Text>
          <Text fz="sm" c="dark.8" fs="italic">
            {attempt.recognizedText ?? "—"}
          </Text>
        </Stack>

        {attempt.words.length > 0 && (
          <Stack gap={6}>
            <Text fz="xs" fw={700} c="dimmed">
              {isVi ? "TỪNG TỪ" : "WORD BY WORD"}
            </Text>
            <Group gap={6}>
              {attempt.words.map((word) => (
                <WordChip key={word.orderNo} word={word} />
              ))}
            </Group>
            <Text fz={10} c="dimmed">
              {isVi
                ? "Di chuột lên một từ để xem điểm từng âm vị."
                : "Hover a word for its phoneme scores."}
            </Text>
          </Stack>
        )}

        {attempt.audioUrl !== "" && (
          <Box>
            <Text fz="xs" fw={700} c="dimmed" mb={6}>
              {isVi ? "BẢN GHI CỦA BẠN" : "YOUR RECORDING"}
            </Text>
            <audio controls preload="none" src={attempt.audioUrl}>
              {isVi ? "Bản ghi của bạn" : "Your recording"}
            </audio>
          </Box>
        )}

        {attempt.errorCode !== null && (
          <Alert color="warn" title={isVi ? "Không chấm được" : "Not scored"}>
            <Text fz="sm">{attempt.errorCode}</Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
