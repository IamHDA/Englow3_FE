"use client";

import { Alert, Badge, Box, Button, Group, Stack, Text } from "@mantine/core";
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
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";

interface PronunciationPracticeViewProps {
  promptId: string;
}

export function PronunciationPracticeView({
  promptId,
}: PronunciationPracticeViewProps) {
  const { t } = useLanguage();
  const { data, loading, error, refetch } = useSpeakingPromptQuery({
    variables: { id: promptId },
  });

  const prompt = data?.speakingPrompt;

  if (error !== undefined && prompt === undefined) {
    return (
      <Page width="focus">
        <LoadErrorState
          error={error}
          thing={{ vi: "câu luyện phát âm", en: "prompt" }}
          back={{
            href: "/study/pronunciation",
            label: t.pronunciation.backToPromptsButton,
          }}
          onRetry={() => void refetch()}
        />
      </Page>
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
  const { t } = useLanguage();
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
    <Page width="focus">
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
            {t.pronunciation.backToLibraryButton}
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
            title={t.pronunciation.notFinishedTitle}
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
    </Page>
  );
}
