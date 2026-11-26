import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { useRef, useState } from "react";
import { View } from "react-native";

import { AppText, Button, Card, Notice, Row } from "@/ui/components";
import { spacing } from "@/ui/theme";

import {
  ImportSessionExpiredError,
  importDictation,
  importFlashcards,
  validateDictationImport,
  validateFlashcardImport,
  type ImportReport,
} from "./importApi";

/**
 * Imports a generated batch: a dry run first, then the real import, which
 * only opens once the dry run shows what would be kept. As the web's
 * FlashcardImportPanel; `setId` is the draft set cards go into, absent for a
 * dictation batch, which creates its own lessons.
 */
export function ImportPanel({
  kind,
  setId,
}: {
  kind: "flashcards" | "dictation";
  setId?: string;
}) {
  const dictation = kind === "dictation";
  const [file, setFile] = useState<{ name: string; json: string } | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  async function choose() {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain", "*/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    try {
      const json = await new File(asset.uri).text();
      setFile({ name: asset.name, json });
      // An old report speaks for the old file.
      setReport(null);
    } catch {
      setError("Không đọc được tệp.");
    }
  }

  async function run(commit: boolean) {
    if (
      !file ||
      pending.current ||
      (!dictation && !setId) ||
      (commit && (!report || report.committed || report.acceptedCount === 0))
    )
      return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      if (dictation)
        setReport(
          commit
            ? await importDictation(file.json)
            : await validateDictationImport(file.json),
        );
      else if (setId)
        setReport(
          commit
            ? await importFlashcards(setId, file.json)
            : await validateFlashcardImport(file.json),
        );
    } catch (failure) {
      setReport(null);
      setError(
        failure instanceof ImportSessionExpiredError
          ? "Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại."
          : failure instanceof Error
            ? failure.message
            : "Không đọc được tệp.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <AppText variant="label">
        {dictation ? "Nhập bài nghe từ tệp" : "Nhập thẻ từ tệp"}
      </AppText>
      <AppText variant="caption" tone="muted">
        {dictation
          ? "Tệp shadowing batch do data pipeline sinh ra. Mỗi clip thành một bài nháp, mỗi đoạn thành một câu."
          : "Tệp JSON do data pipeline sinh ra. Kiểm tra trước để xem dòng nào không dùng được, rồi mới nhập vào bộ nháp."}
      </AppText>
      <Button
        title={file ? file.name : "Chọn tệp .json"}
        icon="document-outline"
        size="sm"
        variant="ghost"
        disabled={busy}
        onPress={() => void choose()}
        style={{ alignSelf: "flex-start", marginVertical: spacing.xs }}
      />
      <Row wrap gap={spacing.xs}>
        <Button
          title="Kiểm tra thử"
          size="sm"
          variant="secondary"
          loading={busy}
          disabled={!file}
          onPress={() => void run(false)}
        />
        <Button
          title={dictation ? "Nhập các bài này" : "Nhập vào bộ này"}
          size="sm"
          disabled={
            !file ||
            busy ||
            !report ||
            report.committed ||
            report.acceptedCount === 0
          }
          onPress={() => void run(true)}
        />
      </Row>
      {!report && !error ? (
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginTop: spacing.xs }}
        >
          Kiểm tra thử trước khi nhập.
        </AppText>
      ) : null}
      <Notice message={error} />
      {report ? (
        <View style={{ marginTop: spacing.xs }}>
          <Notice
            tone={report.committed ? "success" : "info"}
            message={`${report.committed ? "Đã nhập" : "Sẽ nhập"} ${report.acceptedCount} ${dictation ? "bài" : "thẻ"}${
              report.sentenceCount !== undefined
                ? ` (${report.sentenceCount} câu)`
                : ""
            }. ${
              report.rejectedCount > 0
                ? `Bỏ qua ${report.rejectedCount} ${dictation ? "clip" : "dòng"}.`
                : ""
            }`}
          />
          {report.rejections.map((rejection) => (
            <AppText
              key={`${rejection.index}-${rejection.lemma ?? rejection.clipId}`}
              variant="caption"
            >
              Dòng {rejection.index} ·{" "}
              {rejection.lemma || rejection.clipId || "—"} · {rejection.reason}
            </AppText>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
