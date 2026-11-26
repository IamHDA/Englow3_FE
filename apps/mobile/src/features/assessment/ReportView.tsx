import { View } from "react-native";

import { AppText, Card, ProgressBar, Row, Section } from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

import { CRITERION_LABELS, type AssessmentReport } from "./report";

/** An assessed attempt's feedback: band, four criteria, what went well, what to work on. */
export function ReportView({ report }: { report: AssessmentReport }) {
  return (
    <>
      <Card style={{ alignItems: "center", marginBottom: spacing.lg }}>
        <AppText variant="caption" tone="muted">
          Điểm luyện tập ước lượng
        </AppText>
        <AppText variant="title" tone="primary">
          {report.overall.toFixed(1)}
        </AppText>
        <AppText tone="muted" style={{ textAlign: "center" }}>
          {report.summary}
        </AppText>
      </Card>

      <Section title="Theo tiêu chí">
        {report.criteria.map((criterion) => (
          <Card
            key={criterion.key}
            style={{
              marginBottom: spacing.sm,
              borderColor:
                report.focusCriterion === criterion.key
                  ? colors.accent
                  : colors.border,
            }}
          >
            <Row style={{ justifyContent: "space-between" }}>
              <AppText variant="label" style={{ flex: 1 }}>
                {CRITERION_LABELS[criterion.key] ?? criterion.key}
              </AppText>
              {criterion.score !== undefined ? (
                <AppText variant="label">{criterion.score.toFixed(1)}</AppText>
              ) : null}
            </Row>
            {criterion.score !== undefined ? (
              <View style={{ marginVertical: spacing.xs }}>
                <ProgressBar value={criterion.score / 9} />
              </View>
            ) : null}
            <AppText>{criterion.feedback}</AppText>
            {criterion.quote ? (
              <AppText
                variant="caption"
                tone="muted"
                style={{ fontStyle: "italic", marginTop: spacing.xs }}
              >
                “{criterion.quote}”
              </AppText>
            ) : null}
          </Card>
        ))}
        {report.scoresHidden ? (
          <AppText variant="caption" tone="muted">
            Điểm từng tiêu chí được ẩn; nhận xét vẫn đầy đủ.
          </AppText>
        ) : null}
      </Section>

      {report.strengths.length > 0 ? (
        <Section title="Điểm mạnh">
          {report.strengths.map((item) => (
            <AppText key={item} style={{ marginBottom: spacing.xs }}>
              ✓ {item}
            </AppText>
          ))}
        </Section>
      ) : null}
      {report.improvements.length > 0 ? (
        <Section title="Cần cải thiện">
          {report.improvements.map((item) => (
            <AppText key={item} style={{ marginBottom: spacing.xs }}>
              → {item}
            </AppText>
          ))}
        </Section>
      ) : null}
    </>
  );
}
