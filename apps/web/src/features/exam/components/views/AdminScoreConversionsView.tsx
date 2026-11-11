"use client";
import {
  Alert,
  Button,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  scoreConversions,
  publishScoreConversions,
  ScoreConfigurationError,
  type ScoreConversion,
} from "../../api/scoreConversions";
export function AdminScoreConversionsView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    revision: number;
    rows?: ScoreConversion[];
    error?: boolean;
  }>({ revision: -1 });
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState("");
  const [json, setJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    void scoreConversions(
      AbortSignal.any([abort.signal, AbortSignal.timeout(15_000)]),
    )
      .then((rows) => {
        if (!abort.signal.aborted) setState({ revision, rows });
      })
      .catch(() => {
        if (!abort.signal.aborted) setState({ revision, error: true });
      });
    return () => abort.abort();
  }, [revision]);
  async function publish() {
    if (busy) return;
    setError(null);
    let rows: unknown;
    try {
      rows = JSON.parse(json);
    } catch {
      setError(tr("Mảng JSON chưa hợp lệ.", "Enter a valid JSON array."));
      return;
    }
    if (!Array.isArray(rows) || rows.length < 2 || rows.length > 202) {
      setError(
        tr(
          "Cần 2–202 dải điểm cho hai kỹ năng.",
          "Provide 2–202 score ranges for both skills.",
        ),
      );
      return;
    }
    setBusy(true);
    try {
      const result = await publishScoreConversions(date, source.trim(), rows);
      setState({ revision, rows: result });
      setJson("");
    } catch (failure) {
      const code =
        failure instanceof ScoreConfigurationError ? failure.code : "UNKNOWN";
      setError(
        code === "SCORE_TABLE_EXISTS"
          ? tr(
              "Ngày này đã có bảng. Chọn ngày hiệu lực mới hơn.",
              "This date already has a table. Choose a later effective date.",
            )
          : code === "TOEIC_CONVERSION_INVALID"
            ? tr(
                "Hai kỹ năng phải phủ đủ 0–100 câu đúng, không trùng dải; điểm tăng dần từ 5–495 theo bước 5.",
                "Both skills must cover 0–100 correct answers without overlap, with nondecreasing scores 5–495 in steps of five.",
              )
            : tr(
                "Không lưu được cấu hình. Kiểm tra nguồn, ngày hiệu lực và kết nối.",
                "Could not save. Check the reference, effective date and connection.",
              ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <PageHeader title={tr("Quy đổi điểm TOEIC", "TOEIC score conversion")} />
      <Stack gap="lg">
        <Alert>
          {tr(
            "Chỉ nhập bảng có nguồn đã được kiểm duyệt. Mỗi kỹ năng gồm 100 câu; tổng điểm chỉ có khi đủ Listening và Reading. Phiên bản mới áp dụng từ ngày hiệu lực; kết quả đã chấm được giữ nguyên.",
            "Only publish a reviewed reference table. Each skill has 100 questions; a total requires both Listening and Reading. New versions apply from their effective date and preserve recorded results.",
          )}
        </Alert>
        <TextInput
          type="date"
          label={tr("Ngày hiệu lực", "Effective date")}
          value={date}
          onChange={(e) => setDate(e.currentTarget.value)}
          disabled={busy}
        />
        <TextInput
          label={tr(
            "Nguồn / phiên bản tài liệu",
            "Reference / document version",
          )}
          maxLength={1000}
          value={source}
          onChange={(e) => setSource(e.currentTarget.value)}
          disabled={busy}
        />
        <Textarea
          label={tr("Các dải quy đổi (JSON)", "Conversion ranges (JSON)")}
          description="sectionType: LISTENING / READING · rawScoreFrom · rawScoreTo · convertedScore"
          minRows={7}
          maxLength={64000}
          value={json}
          onChange={(e) => setJson(e.currentTarget.value)}
          disabled={busy}
        />
        {error && (
          <Alert color="orange" role="alert">
            {error}
          </Alert>
        )}
        <Group>
          <Button
            loading={busy}
            disabled={!date || !source.trim() || !json.trim()}
            onClick={() => void publish()}
          >
            {tr("Xuất bản bảng quy đổi", "Publish conversion table")}
          </Button>
          <Button variant="default" onClick={() => setRevision((v) => v + 1)}>
            {tr("Tải lại", "Refresh")}
          </Button>
        </Group>
        {state.revision !== revision ? (
          <Skeleton height={120} />
        ) : state.error ? (
          <Alert color="orange" role="alert">
            {tr(
              "Không tải được cấu hình. Bấm Tải lại để thử lại.",
              "Could not load configuration. Choose Refresh to retry.",
            )}
          </Alert>
        ) : state.rows?.length ? (
          <Table.ScrollContainer minWidth={600}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  {[
                    tr("Ngày", "Date"),
                    tr("Kỹ năng", "Skill"),
                    tr("Số câu đúng", "Correct count"),
                    tr("Điểm", "Score"),
                    tr("Nguồn", "Reference"),
                  ].map((s) => (
                    <Table.Th key={s}>{s}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {state.rows.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td>{r.effectiveFrom}</Table.Td>
                    <Table.Td>{r.sectionType}</Table.Td>
                    <Table.Td>
                      {r.rawScoreFrom}–{r.rawScoreTo}
                    </Table.Td>
                    <Table.Td>{r.convertedScore}</Table.Td>
                    <Table.Td>{r.sourceReference}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : (
          <Text>
            {tr(
              "Chưa có bảng TOEIC. Các kết quả hiện chỉ có điểm bài tập.",
              "No TOEIC table is configured. Results currently show exercise points only.",
            )}
          </Text>
        )}
      </Stack>
    </Page>
  );
}
