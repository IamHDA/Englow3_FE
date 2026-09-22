"use client";

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
import React, { useState } from "react";

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
  const isDictation = kind === "dictation";
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<FlashcardImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(commit: boolean) {
    if (!file) {
      return;
    }

    // Read at the moment of upload rather than held in state: a token taken
    // when the screen opened can have expired by the time a large file is
    // chosen and sent.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setError("Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
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
        failure instanceof Error ? failure.message : "Không đọc được tệp.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card withBorder radius="md" p="md">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={4}>
            {isDictation ? "Nhập bài nghe từ tệp" : "Nhập thẻ từ tệp"}
          </Title>
          <Text size="sm" c="dimmed">
            {isDictation
              ? "Tệp shadowing batch do data pipeline sinh ra. Mỗi clip thành một bài nháp, mỗi đoạn thành một câu."
              : "Tệp JSON do data pipeline sinh ra. Kiểm tra trước để xem dòng nào không dùng được, rồi mới nhập vào bộ nháp."}
          </Text>
        </Stack>

        <FileInput
          accept="application/json,.json"
          placeholder="Chọn tệp .json"
          leftSection={<IconFileUpload size={16} />}
          value={file}
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
            Kiểm tra thử
          </Button>
          <Button
            leftSection={<IconUpload size={16} />}
            disabled={!file || busy || !report || report.acceptedCount === 0}
            onClick={() => void run(true)}
          >
            {isDictation ? "Nhập các bài này" : "Nhập vào bộ này"}
          </Button>
        </Group>

        {/* Nút nhập chỉ mở sau khi đã kiểm tra: scope yêu cầu xem kết quả
            kiểm tra trước khi lưu, và đây là chỗ luật đó có hiệu lực. */}
        {!report && !error && (
          <Text size="xs" c="dimmed">
            Kiểm tra thử trước khi nhập.
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
                {`${report.committed ? "Đã nhập" : "Sẽ nhập"} ${report.acceptedCount} ${
                  isDictation ? "bài" : "thẻ"
                }`}
                {report.sentenceCount !== undefined &&
                  ` (${report.sentenceCount} câu)`}
                {". "}
                {report.rejectedCount > 0 &&
                  `Bỏ qua ${report.rejectedCount} ${isDictation ? "clip" : "dòng"}.`}
              </Text>
            </Alert>

            {report.rejections.length > 0 && (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={80}>Dòng</Table.Th>
                    <Table.Th>{isDictation ? "Clip" : "Từ"}</Table.Th>
                    <Table.Th>Lý do</Table.Th>
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
