"use client";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";
import { removeRecording } from "@/shared/storage/browserDrafts";

export function TutorDataControls({
  account,
  onPurged,
  disabled = false,
  includeMemory = false,
}: {
  account: string;
  disabled?: boolean;
  includeMemory?: boolean;
  onPurged: () => void;
}) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const [opened, setOpened] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const lock = useRef(false);
  const exportAbort = useRef<AbortController | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportCount, setExportCount] = useState(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      exportAbort.current?.abort();
    };
  }, []);
  async function exportData() {
    if (lock.current || disabled) return;
    lock.current = true;
    setBusy(true);
    setError(false);
    const controller = new AbortController();
    exportAbort.current = controller;
    setExporting(true);
    setExportCount(0);
    try {
      const data: Record<string, unknown[]> = {};
      for (const kind of [
        "CONVERSATIONS",
        "MESSAGES",
        "VERSIONS",
        "REPORTS",
        "RECORDINGS",
        ...(includeMemory ? ["MEMORY"] : []),
      ]) {
        data[kind] = [];
        for (let page = 0; page <= 100000; page++) {
          const response = await fetch(
            `/api/tutor/data?${new URLSearchParams({ kind, page: String(page) })}`,
            {
              headers: { [CSRF_HEADER]: CSRF_VALUE },
              signal: AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(40_000),
              ]),
            },
          );
          if (!response.ok) throw new Error("Export failed");
          const result = await response.json();
          data[kind].push(...result.items);
          setExportCount((value) => value + result.items.length);
          if (!result.hasMore) break;
          await new Promise((resolve) => setTimeout(resolve, 350));
          if (controller.signal.aborted) throw new Error("Export cancelled");
        }
      }
      if (controller.signal.aborted || !alive.current)
        throw new Error("Export cancelled");
      const blob = new Blob(
        [
          JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              scope: "Tutor conversations and transcripts",
              data,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "englow3-tutor-data.json";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      setExporting(false);
      exportAbort.current = null;
      lock.current = false;
      setBusy(false);
    }
  }
  async function purge() {
    if (lock.current || disabled || confirmation !== "DELETE") return;
    lock.current = true;
    setBusy(true);
    setError(false);
    let serverDeleted = false;
    try {
      const response = await fetch("/api/tutor/data", {
        method: "DELETE",
        headers: { [CSRF_HEADER]: CSRF_VALUE },
        signal: AbortSignal.timeout(40_000),
      });
      if (!response.ok) throw new Error("Deletion failed");
      serverDeleted = true;
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("englow:tutor:") && key.includes(account))
          sessionStorage.removeItem(key);
      }
      await removeRecording(`englow:tutor:voice:${account}`);
      setOpened(false);
      setDeleted(true);
    } catch {
      setError(true);
    } finally {
      if (serverDeleted && alive.current) onPurged();
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Stack gap="xs">
      {exporting && (
        <Group>
          <Text size="sm" role="status">
            {tr("Đang xuất", "Exporting")} · {exportCount} {tr("mục", "items")}
          </Text>
          <Button variant="subtle" onClick={() => exportAbort.current?.abort()}>
            {tr("Dừng xuất", "Cancel export")}
          </Button>
        </Group>
      )}
      <Group gap="xs">
        <Button
          variant="subtle"
          mih={44}
          loading={busy}
          disabled={disabled}
          leftSection={<IconDownload size={16} />}
          onClick={() => void exportData()}
        >
          {tr("Xuất dữ liệu Tutor", "Export Tutor data")}
        </Button>
        <Button
          variant="subtle"
          mih={44}
          color="red"
          disabled={busy || disabled}
          leftSection={<IconTrash size={16} />}
          onClick={() => {
            setConfirmation("");
            setError(false);
            setOpened(true);
          }}
        >
          {tr("Xóa dữ liệu trò chuyện", "Delete chat data")}
        </Button>
      </Group>
      {error && (
        <Alert color="orange" role="alert">
          {tr(
            "Chưa hoàn tất thao tác. Nếu đang xóa, bấm thử lại để hoàn tất cả bản sao trên thiết bị.",
            "Action did not finish. If deleting, retry to finish clearing local copies too.",
          )}
        </Alert>
      )}
      {deleted && (
        <Text size="sm" role="status">
          {tr(
            "Đã xóa nội dung trò chuyện và phiên âm. File ghi âm đang được dọn; số lượt AI đã dùng vẫn được giữ.",
            "Chat content and transcripts were deleted. Recording files are being cleaned up; AI usage is retained.",
          )}
        </Text>
      )}
      <Modal
        opened={opened}
        onClose={() => !busy && setOpened(false)}
        title={tr(
          "Xóa toàn bộ trò chuyện Tutor?",
          "Delete all Tutor conversations?",
        )}
      >
        <Stack>
          <Text>
            {tr(
              "Thao tác này xóa câu hỏi, đáp án, phiên bản cũ, báo cáo và bản ghi của bạn. Không thể khôi phục trong ứng dụng. Hãy xuất dữ liệu trước nếu cần.",
              "This removes your questions, answers, old revisions, reports and recordings. You cannot restore them in the app. Export a copy first if needed.",
            )}
          </Text>
          <Text size="sm" c="dimmed">
            {tr(
              "Đây là xóa dữ liệu, khác với lưu trữ hội thoại. Không xóa tài khoản hoặc học liệu đã xuất bản.",
              "This deletes data. Archiving a conversation only hides it. Your account and published learning materials are retained.",
            )}
          </Text>
          <TextInput
            label={tr("Nhập DELETE để xác nhận", "Type DELETE to confirm")}
            value={confirmation}
            onChange={(event) => setConfirmation(event.currentTarget.value)}
            disabled={busy || disabled}
          />
          <Button
            color="red"
            mih={44}
            disabled={disabled || confirmation !== "DELETE"}
            loading={busy}
            onClick={() => void purge()}
          >
            {tr("Xóa vĩnh viễn dữ liệu Tutor", "Permanently delete Tutor data")}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
