"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  Alert,
  Button,
  Card,
  FileInput,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconFileUpload, IconUpload } from "@tabler/icons-react";
import React, { useRef, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  importDictation,
  importFlashcards,
  validateDictationImport,
  validateFlashcardImport,
  type FlashcardImportReport,
} from "../../../api/importFlashcards";

interface FlashcardImportPanelProps {
  /**
   * The draft set the cards go into, for a flashcard batch. Omitted for a
   * shadowing batch, which creates its own lessons - one per clip.
   */
  setId?: string;
  kind?: "flashcards" | "dictation";
}

/**
 * Nhập một lô thẻ đã sinh sẵn.
 *
 * Kiểm tra trước, ghi sau, và đó là chủ đích: một tệp ba nghìn thẻ không ai
 * muốn phát hiện là sai sau khi nó đã nằm trong bộ. Báo cáo thử và báo cáo
 * thật có cùng hình dạng, chỉ khác một chữ - nên `committed` là thứ phân biệt
 * chúng, không phải trí nhớ của người bấm nút.
 */
export function FlashcardImportPanel({
  setId,
  kind = "flashcards",
}: FlashcardImportPanelProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const isDictation = kind === "dictation";
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<FlashcardImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  async function run(commit: boolean) {
    if (
      !file ||
      pending.current ||
      (!isDictation && !setId) ||
      (commit && (!report || report.committed || report.acceptedCount === 0))
    ) {
      return;
    }

    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      // Read at the moment of upload rather than held in state: a token taken
      // when the screen opened can have expired by the time a large file is
      // chosen and sent.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError(
          tr(
            "Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.",
            "Your session has expired. Sign in again and retry.",
          ),
        );
        return;
      }

      const json = await file.text();
      if (isDictation) {
        setReport(
          commit
            ? await importDictation(json, token)
            : await validateDictationImport(json, token),
        );
      } else if (setId) {
        setReport(
          commit
            ? await importFlashcards(setId, json, token)
            : await validateFlashcardImport(json, token),
        );
      }
    } catch (failure) {
      setReport(null);
      setError(
        failure instanceof Error
          ? failure.message
          : tr("Không đọc được tệp.", "Could not read the file."),
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <Card withBorder radius="md" p="md">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={4}>
            {isDictation
              ? tr("Nhập bài nghe từ tệp", "Import lessons from a file")
              : tr("Nhập thẻ từ tệp", "Import cards from a file")}
          </Title>
          <Text size="sm" c="dimmed">
            {isDictation
              ? tr(
                  "Tệp shadowing batch do data pipeline sinh ra. Mỗi clip thành một bài nháp, mỗi đoạn thành một câu.",
                  "A shadowing batch file from the data pipeline. Each clip becomes a draft lesson, each segment a sentence.",
                )
              : tr(
                  "Tệp JSON do data pipeline sinh ra. Kiểm tra trước để xem dòng nào không dùng được, rồi mới nhập vào bộ nháp.",
                  "A JSON file from the data pipeline. Check it first to see which rows are unusable, then import into the draft set.",
                )}
          </Text>
        </Stack>

        <FileInput
          accept="application/json,.json"
          placeholder={tr("Chọn tệp .json", "Choose a .json file")}
          leftSection={<IconFileUpload size={16} />}
          value={file}
          disabled={busy}
          onChange={(next) => {
            setFile(next);
            // Báo cáo cũ nói về tệp cũ. Giữ lại là nói dối về tệp vừa chọn.
            setReport(null);
            setError(null);
          }}
          clearable
        />

        <Group>
          <Button
            variant="light"
            disabled={!file || busy}
            loading={busy}
            onClick={() => void run(false)}
          >
            {tr("Kiểm tra thử", "Dry run")}
          </Button>
          <Button
            leftSection={<IconUpload size={16} />}
            disabled={
              !file ||
              busy ||
              !report ||
              report.committed ||
              report.acceptedCount === 0
            }
            onClick={() => void run(true)}
          >
            {isDictation
              ? tr("Nhập các bài này", "Import these lessons")
              : tr("Nhập vào bộ này", "Import into this set")}
          </Button>
        </Group>

        {/* Nút nhập chỉ mở sau khi đã kiểm tra: scope yêu cầu xem kết quả
            kiểm tra trước khi lưu, và đây là chỗ luật đó có hiệu lực. */}
        {!report && !error && (
          <Text size="xs" c="dimmed">
            {tr(
              "Kiểm tra thử trước khi nhập.",
              "Do a dry run before importing.",
            )}
          </Text>
        )}

        {error && (
          <Alert color="red" variant="light">
            <Text size="sm">{error}</Text>
          </Alert>
        )}

        {report && (
          <Stack gap="xs">
            <Alert color={report.committed ? "teal" : "blue"} variant="light">
              <Text size="sm">
                {isVi
                  ? `${report.committed ? "Đã nhập" : "Sẽ nhập"} ${report.acceptedCount} ${isDictation ? "bài" : "thẻ"}`
                  : `${report.committed ? "Imported" : "Will import"} ${report.acceptedCount} ${isDictation ? "lessons" : "cards"}`}
                {report.sentenceCount !== undefined &&
                  ` (${report.sentenceCount} ${tr("câu", "sentences")})`}
                {". "}
                {report.rejectedCount > 0 &&
                  (isVi
                    ? `Bỏ qua ${report.rejectedCount} ${isDictation ? "clip" : "dòng"}.`
                    : `Skipped ${report.rejectedCount} ${isDictation ? "clips" : "rows"}.`)}
              </Text>
            </Alert>

            {report.rejections.length > 0 && (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={80}>{tr("Dòng", "Row")}</Table.Th>
                    <Table.Th>
                      {isDictation ? "Clip" : tr("Từ", "Word")}
                    </Table.Th>
                    <Table.Th>{tr("Lý do", "Reason")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {report.rejections.map((rejection) => (
                    <Table.Tr
                      key={`${rejection.index}-${rejection.lemma ?? rejection.clipId}`}
                    >
                      <Table.Td>{rejection.index}</Table.Td>
                      <Table.Td>
                        {rejection.lemma || rejection.clipId || "—"}
                      </Table.Td>
                      <Table.Td>{rejection.reason}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
