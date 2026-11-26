import { useState } from "react";
import { View } from "react-native";

import { errorMessage } from "@/lib/errors";
import {
  useSubmitDictationMutation,
  type SubmitDictationMutation,
} from "@/lib/graphql/generated";
import { SegmentPlayer } from "@/ui/audio";
import {
  AppText,
  Badge,
  Button,
  Card,
  Notice,
  Row,
  TextField,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

type Result = SubmitDictationMutation["submitDictation"];

export type DictationSentence = {
  id: string;
  audioUrl: string | null;
  audioStartMs?: number | null;
  audioEndMs?: number | null;
  bestAccuracyPercent?: number | null;
};

/**
 * One sentence: listen, type, check. The backend grades word by word and says
 * whether the sentence is cleared; the learner may try again as often as they
 * like before moving on.
 */
export function DictationExercise({
  sentence,
  initialResponse = "",
  onChecked,
  onNext,
  nextLabel = "Câu tiếp",
}: {
  sentence: DictationSentence;
  initialResponse?: string;
  onChecked?: (result: Result) => void;
  onNext?: () => void;
  nextLabel?: string;
}) {
  const [response, setResponse] = useState(initialResponse);
  const [result, setResult] = useState<Result | null>(null);
  const [submit, state] = useSubmitDictationMutation();

  async function check() {
    if (!response.trim()) return;
    try {
      const { data } = await submit({
        variables: { sentenceId: sentence.id, response },
      });
      if (data) {
        setResult(data.submitDictation);
        onChecked?.(data.submitDictation);
      }
    } catch {
      // state.error renders below
    }
  }

  return (
    <Card>
      <SegmentPlayer
        url={sentence.audioUrl}
        startMs={sentence.audioStartMs}
        endMs={sentence.audioEndMs}
      />
      <View style={{ height: spacing.md }} />
      <TextField
        label="Bạn nghe được gì?"
        value={response}
        onChangeText={(text) => {
          setResponse(text);
          if (result) setResult(null);
        }}
        multiline
        autoCapitalize="sentences"
        autoCorrect={false}
        placeholder="Gõ lại câu vừa nghe…"
      />
      <Notice message={state.error ? errorMessage(state.error) : null} />

      {result ? (
        <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
          <Row>
            <Badge
              label={`${result.accuracyPercent}% · ${result.correctWordCount}/${result.totalWordCount} từ`}
              tone={result.cleared ? "success" : "accent"}
            />
            {result.cleared ? (
              <AppText tone="success">Đạt!</AppText>
            ) : (
              <AppText tone="muted">Thử lại nhé</AppText>
            )}
          </Row>
          <AppText variant="label" style={{ color: colors.success }}>
            {result.correctText}
          </AppText>
          {result.translationVi ? (
            <AppText variant="caption" tone="muted">
              {result.translationVi}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <Row gap={spacing.sm}>
        <Button
          title={result ? "Kiểm tra lại" : "Kiểm tra"}
          onPress={() => void check()}
          loading={state.loading}
          disabled={!response.trim()}
          style={{ flex: 1 }}
        />
        {onNext && result ? (
          <Button
            title={nextLabel}
            variant="secondary"
            onPress={onNext}
            style={{ flex: 1 }}
          />
        ) : null}
      </Row>
    </Card>
  );
}
