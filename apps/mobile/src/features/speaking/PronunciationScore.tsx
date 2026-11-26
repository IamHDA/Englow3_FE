import { StyleSheet, View } from "react-native";

import type { SpeakingAttemptFieldsFragment } from "@/lib/graphql/generated";
import { AppText, Card, ProgressBar, Row } from "@/ui/components";
import { colors, radius, spacing } from "@/ui/theme";

function scoreColor(percent: number | null | undefined) {
  if (percent == null) return colors.textFaint;
  if (percent >= 80) return colors.success;
  if (percent >= 60) return colors.accent;
  return colors.danger;
}

/** Overall scores and the reference text coloured word by word. */
export function PronunciationScore({
  attempt,
}: {
  attempt: SpeakingAttemptFieldsFragment;
}) {
  const metrics: [string, number | null | undefined][] = [
    ["Phát âm", attempt.pronunciationPercent],
    ["Chính xác", attempt.accuracyPercent],
    ["Trôi chảy", attempt.fluencyPercent],
    ["Đầy đủ", attempt.completenessPercent],
    ["Ngữ điệu", attempt.prosodyPercent],
  ];
  const words = [...attempt.words].sort((a, b) => a.orderNo - b.orderNo);

  return (
    <Card>
      <AppText
        variant="heading"
        style={{ color: scoreColor(attempt.pronunciationPercent) }}
      >
        {attempt.pronunciationPercent != null
          ? `${Math.round(attempt.pronunciationPercent)}/100`
          : "—"}
      </AppText>
      {metrics.map(([label, value]) =>
        value == null ? null : (
          <View key={label} style={{ marginTop: spacing.sm }}>
            <Row style={{ justifyContent: "space-between" }}>
              <AppText variant="caption" tone="muted">
                {label}
              </AppText>
              <AppText variant="caption">{Math.round(value)}</AppText>
            </Row>
            <ProgressBar value={value / 100} color={scoreColor(value)} />
          </View>
        ),
      )}

      {words.length > 0 ? (
        <>
          <AppText
            variant="label"
            style={{ marginTop: spacing.lg, marginBottom: spacing.xs }}
          >
            Từng từ
          </AppText>
          <Row wrap gap={spacing.xs}>
            {words.map((word) => (
              <View
                key={`${word.orderNo}-${word.word}`}
                style={[
                  styles.word,
                  { borderColor: scoreColor(word.accuracyPercent) },
                ]}
                accessibilityLabel={`${word.word}: ${word.accuracyPercent ?? 0} điểm`}
              >
                <AppText style={{ color: scoreColor(word.accuracyPercent) }}>
                  {word.word}
                </AppText>
                {word.errorType && word.errorType !== "None" ? (
                  <AppText variant="caption" tone="muted">
                    {WORD_ERRORS[word.errorType] ?? word.errorType}
                  </AppText>
                ) : null}
              </View>
            ))}
          </Row>
          <AppText
            variant="caption"
            tone="muted"
            style={{ marginTop: spacing.sm }}
          >
            Xanh: tốt · Cam: cần luyện thêm · Đỏ: phát âm sai
          </AppText>
        </>
      ) : null}

      {attempt.recognizedText ? (
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginTop: spacing.md }}
        >
          Máy nghe được: “{attempt.recognizedText}”
        </AppText>
      ) : null}
    </Card>
  );
}

const WORD_ERRORS: Record<string, string> = {
  Mispronunciation: "sai âm",
  Omission: "bỏ sót",
  Insertion: "thừa",
  UnexpectedBreak: "ngắt quãng",
  MissingBreak: "thiếu ngắt",
  Monotone: "đều giọng",
};

const styles = StyleSheet.create({
  word: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignItems: "center",
  },
});
