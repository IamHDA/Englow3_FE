import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import {
  publishScoreConversions,
  scoreConversions,
  type ScoreConversion,
} from "@/features/admin/adminApi";
import { AdminOnly } from "@/features/admin/AdminOnly";
import { RestError } from "@/lib/rest";
import { useRest } from "@/lib/useRest";
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

const PUBLISH_ERRORS: Record<string, string> = {
  SCORE_TABLE_EXISTS: "Ngày này đã có bảng. Chọn ngày hiệu lực mới hơn.",
  TOEIC_CONVERSION_INVALID:
    "Hai kỹ năng phải phủ đủ 0–100 câu đúng, không trùng dải; điểm tăng dần từ 5–495 theo bước 5.",
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const EXAMPLE = `[
  { "sectionType": "LISTENING", "rawScoreFrom": 0, "rawScoreTo": 5, "convertedScore": 5 },
  { "sectionType": "READING", "rawScoreFrom": 0, "rawScoreTo": 5, "convertedScore": 5 }
]`;

/** TOEIC raw-to-scaled tables, versioned by effective date. As the web's AdminScoreConversionsView. */
export default function ScoreConversionsScreen() {
  return (
    <AdminOnly>
      <ScoreConversions />
    </AdminOnly>
  );
}

function ScoreConversions() {
  const table = useRest("toeic", scoreConversions);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState("");
  const [json, setJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  async function publish() {
    if (busy) return;
    setError(null);
    setPublished(false);
    if (!DATE.test(date)) {
      setError("Ngày hiệu lực có dạng YYYY-MM-DD.");
      return;
    }
    let rows: unknown;
    try {
      rows = JSON.parse(json);
    } catch {
      setError("Mảng JSON chưa hợp lệ.");
      return;
    }
    if (!Array.isArray(rows) || rows.length < 2 || rows.length > 202) {
      setError("Cần 2–202 dải điểm cho hai kỹ năng.");
      return;
    }
    setBusy(true);
    try {
      table.setData(await publishScoreConversions(date, source.trim(), rows));
      setJson("");
      setPublished(true);
    } catch (failure) {
      setError(
        (failure instanceof RestError && PUBLISH_ERRORS[failure.code]) ||
          "Không lưu được cấu hình. Kiểm tra nguồn, ngày hiệu lực và kết nối.",
      );
    } finally {
      setBusy(false);
    }
  }

  const rows = table.data ?? [];
  return (
    <Screen
      refreshing={table.loading && Boolean(table.stale)}
      onRefresh={table.reload}
    >
      <Stack.Screen options={{ title: "Quy đổi điểm TOEIC" }} />
      <Notice
        tone="info"
        message="Chỉ nhập bảng có nguồn đã được kiểm duyệt. Mỗi kỹ năng gồm 100 câu; tổng điểm chỉ có khi đủ Listening và Reading. Phiên bản mới áp dụng từ ngày hiệu lực; kết quả đã chấm được giữ nguyên."
      />
      <Section title="Xuất bản bảng mới">
        <TextField
          label="Ngày hiệu lực (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          editable={!busy}
          keyboardType="numbers-and-punctuation"
        />
        <TextField
          label="Nguồn / phiên bản tài liệu"
          value={source}
          onChangeText={setSource}
          maxLength={1000}
          editable={!busy}
        />
        <TextField
          label="Các dải quy đổi (JSON)"
          hint="sectionType: LISTENING / READING · rawScoreFrom · rawScoreTo · convertedScore"
          value={json}
          onChangeText={setJson}
          placeholder={EXAMPLE}
          multiline
          maxLength={64_000}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />
        <Notice message={error} />
        {published ? (
          <Notice tone="success" message="Đã xuất bản bảng quy đổi." />
        ) : null}
        <Button
          title="Xuất bản bảng quy đổi"
          loading={busy}
          disabled={!date || !source.trim() || !json.trim()}
          onPress={() => void publish()}
        />
      </Section>

      <Section title="Bảng hiện có">
        {table.loading && !table.stale ? (
          <LoadingState />
        ) : table.error ? (
          <ErrorState
            message="Không tải được cấu hình."
            onRetry={table.reload}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="swap-horizontal-outline"
            title="Chưa có bảng TOEIC"
            message="Các kết quả hiện chỉ có điểm bài tập."
          />
        ) : (
          groupByDate(rows).map(([effectiveFrom, group]) => (
            <Card key={effectiveFrom} style={{ marginBottom: spacing.sm }}>
              <AppText variant="label">Hiệu lực từ {effectiveFrom}</AppText>
              {group[0]?.sourceReference ? (
                <AppText variant="caption" tone="muted">
                  {group[0].sourceReference}
                </AppText>
              ) : null}
              {group.map((row) => (
                <Row
                  key={row.id}
                  style={{
                    justifyContent: "space-between",
                    paddingVertical: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <AppText variant="caption">
                    {row.sectionType === "LISTENING" ? "Nghe" : "Đọc"}
                  </AppText>
                  <View style={{ flexDirection: "row", gap: spacing.md }}>
                    <AppText variant="caption" tone="muted">
                      {row.rawScoreFrom}–{row.rawScoreTo} câu
                    </AppText>
                    <AppText variant="caption">{row.convertedScore}</AppText>
                  </View>
                </Row>
              ))}
            </Card>
          ))
        )}
      </Section>
    </Screen>
  );
}

function groupByDate(rows: ScoreConversion[]) {
  const groups = new Map<string, ScoreConversion[]>();
  for (const row of rows) {
    const group = groups.get(row.effectiveFrom) ?? [];
    group.push(row);
    groups.set(row.effectiveFrom, group);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}
