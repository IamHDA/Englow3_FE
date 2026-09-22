"use client";

import {
  Alert,
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

// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useSpeakingPromptQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { useSpeakingPractice } from "../../../hooks/useSpeakingPractice";
import { PronunciationPracticeSkeleton } from "../../blocks/PronunciationPracticeSkeleton";
import { PronunciationScoreCard } from "../../blocks/PronunciationScoreCard";
import { PronunciationVoiceRecorder } from "../../blocks/PronunciationVoiceRecorder";

interface PronunciationPracticeViewProps {
  promptId: string;
}

export function PronunciationPracticeView({
  promptId,
}: PronunciationPracticeViewProps) {
  const { isVi } = useLanguage();
  const { data, loading, error } = useSpeakingPromptQuery({
    variables: { id: promptId },
  });

  const prompt = data?.speakingPrompt;

  if (error !== undefined && prompt === undefined) {
    return (
      <Container size="md" py="xl">
        <Alert
          color="warn"
          title={
            isVi ? "Không mở được câu luyện" : "Could not open this prompt"
          }
        >
          {isVi
            ? "Câu này có thể đã bị gỡ, hoặc backend đang không phản hồi."
            : "It may have been withdrawn, or the backend is not responding."}
        </Alert>
      </Container>
    );
  }

  if (loading || prompt === undefined) {
    return <PronunciationPracticeSkeleton />;
  }

  return <Practice promptId={promptId} prompt={prompt} />;
}

/**
 * Tách riêng vì hook ghi âm cần `referenceText` và không được gọi có điều kiện.
 * Gọi ở view cha sẽ phải gọi trước khi biết câu mẫu là gì.
 */
function Practice({
  promptId,
  prompt,
}: {
  promptId: string;
  prompt: NonNullable<
    ReturnType<typeof useSpeakingPromptQuery>["data"]
  >["speakingPrompt"];
}) {
  const { isVi } = useLanguage();
  const {
    phase,
    recordingSeconds,
    attempt,
    errorMessage,
    localAudioUrl,
    startRecording,
    stopRecording,
    reset,
    playReference,
  } = useSpeakingPractice({
    promptId,
    referenceText: prompt.referenceText,
  });

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href="/study/pronunciation"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
          >
            {isVi ? "Quay lại thư viện phát âm" : "Back to library"}
          </Button>

          <Stack gap={2} align="center">
            <Text fw={700} fz="sm" c="dark.9">
              {prompt.title}
            </Text>
            <Badge variant="light" color="indigo" size="xs">
              {prompt.category}
            </Badge>
          </Stack>

          <Box style={{ width: 140 }} />
        </Group>

        <PronunciationVoiceRecorder
          prompt={prompt}
          phase={phase}
          recordingSeconds={recordingSeconds}
          localAudioUrl={localAudioUrl}
          onPlayReference={playReference}
          onStartRecord={startRecording}
          onStopRecord={stopRecording}
        />

        {errorMessage !== null && (
          <Alert
            color="warn"
            title={isVi ? "Chưa xong" : "Not finished"}
            withCloseButton
            onClose={reset}
          >
            {errorMessage}
          </Alert>
        )}

        {phase === "done" && attempt !== null && (
          <PronunciationScoreCard attempt={attempt} onRetry={reset} />
        )}
      </Stack>
    </Container>
  );
}
