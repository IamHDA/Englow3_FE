import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { formatDateTime } from "@/features/shared/labels";
import { PronunciationScore } from "@/features/speaking/PronunciationScore";
import { useSpeakingSubmission } from "@/features/speaking/useSpeakingSubmission";
import {
  SpeakingAttemptStatus,
  useSpeakingAttemptsQuery,
  useSpeakingPromptQuery,
} from "@/lib/graphql/generated";
import { RecorderPanel, type Recording, PlayButton } from "@/ui/audio";
import {
  AppText,
  Badge,
  Button,
  Card,
  LoadingState,
  Notice,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

export default function PronunciationPracticeScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const prompt = useSpeakingPromptQuery({ variables: { id: lessonId } });
  const history = useSpeakingAttemptsQuery({
    variables: { promptId: lessonId },
    fetchPolicy: "cache-and-network",
  });
  const submission = useSpeakingSubmission(lessonId);
  const [recording, setRecording] = useState<Recording | null>(null);
  const busy =
    submission.phase === "uploading" || submission.phase === "assessing";

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: prompt.data?.speakingPrompt.title ?? "Luyện phát âm",
        }}
      />
      <QueryView
        loading={prompt.loading}
        error={prompt.error}
        data={prompt.data?.speakingPrompt}
        onRetry={() => void prompt.refetch()}
      >
        {(item) => (
          <>
            <Card style={{ marginBottom: spacing.lg }}>
              <AppText variant="caption" tone="muted">
                Đọc to câu sau
              </AppText>
              <AppText variant="heading" style={{ marginVertical: spacing.xs }}>
                {item.referenceText}
              </AppText>
              {item.ipaTranscript ? (
                <AppText tone="primary">/{item.ipaTranscript}/</AppText>
              ) : null}
              {item.translationVi ? (
                <AppText variant="caption" tone="muted">
                  {item.translationVi}
                </AppText>
              ) : null}
              {item.phonemeTarget ? (
                <View style={{ marginTop: spacing.sm }}>
                  <Badge
                    label={`Âm trọng tâm: ${item.phonemeTarget}`}
                    tone="accent"
                  />
                </View>
              ) : null}
              {item.tips ? (
                <AppText
                  variant="caption"
                  tone="primary"
                  style={{ marginTop: spacing.sm }}
                >
                  💡 {item.tips}
                </AppText>
              ) : null}
            </Card>

            <RecorderPanel
              recording={recording}
              onRecorded={setRecording}
              disabled={busy}
              maxSeconds={60}
            />

            <Notice message={submission.error} />
            {busy ? (
              <LoadingState
                label={
                  submission.phase === "uploading"
                    ? "Đang tải bản ghi lên…"
                    : "Đang chấm điểm…"
                }
              />
            ) : (
              <Button
                title="Chấm điểm"
                icon="sparkles"
                disabled={!recording}
                onPress={() => {
                  if (recording) {
                    void submission
                      .submit(recording)
                      .then(() => void history.refetch());
                  }
                }}
              />
            )}

            {submission.phase === "done" && submission.attempt ? (
              <View style={{ marginTop: spacing.lg }}>
                <PronunciationScore attempt={submission.attempt} />
                <Button
                  title="Thử lại"
                  variant="secondary"
                  onPress={() => {
                    setRecording(null);
                    submission.reset();
                    void history.refetch();
                  }}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : null}

            {history.data && history.data.speakingAttempts.length > 0 ? (
              <Section title="Lịch sử luyện">
                {history.data.speakingAttempts.slice(0, 10).map((attempt) => (
                  <Card key={attempt.id} style={{ marginBottom: spacing.sm }}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <AppText variant="caption" tone="muted">
                        {formatDateTime(attempt.createdAt)}
                      </AppText>
                      {attempt.status === SpeakingAttemptStatus.ASSESSED ? (
                        <Badge
                          label={`${Math.round(attempt.pronunciationPercent ?? 0)}/100`}
                          tone={
                            (attempt.pronunciationPercent ?? 0) >= 80
                              ? "success"
                              : "accent"
                          }
                        />
                      ) : (
                        <Badge
                          label={
                            attempt.status === SpeakingAttemptStatus.FAILED
                              ? "Lỗi"
                              : "Đang chấm"
                          }
                          tone={
                            attempt.status === SpeakingAttemptStatus.FAILED
                              ? "danger"
                              : "neutral"
                          }
                        />
                      )}
                    </Row>
                    {attempt.audioUrl ? (
                      <PlayButton url={attempt.audioUrl} label="Nghe lại" />
                    ) : null}
                  </Card>
                ))}
              </Section>
            ) : null}
          </>
        )}
      </QueryView>
    </Screen>
  );
}
