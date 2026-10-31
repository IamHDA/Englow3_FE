"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconMicrophone, IconPlayerStop, IconTrash } from "@tabler/icons-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useAudioRecorder } from "@/shared/audio/useAudioRecorder";
import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

type Receipt = {
  id: string;
  status: string;
  transcript?: string | null;
  errorCode?: string | null;
};
class AudioError extends Error {
  constructor(readonly status: number) {
    super("Audio request failed");
  }
}
async function audioRequest(
  query: Record<string, string>,
  method = "GET",
  body?: Blob,
): Promise<Receipt | null> {
  const response = await fetch(
    `/api/tutor/audio?${new URLSearchParams(query)}`,
    {
      method,
      body,
      headers: {
        [CSRF_HEADER]: CSRF_VALUE,
        ...(body ? { "content-type": "audio/wav" } : {}),
      },
      signal: AbortSignal.timeout(55_000),
    },
  );
  if (method === "DELETE" && response.status === 404) return null;
  if (!response.ok) throw new AudioError(response.status);
  return response.status === 204 ? null : response.json();
}

/** Recording never sends a chat message. The learner reviews and explicitly confirms the transcript. */
export function TutorVoiceInput({
  account,
  disabled,
  onConfirm,
  acceptedDelivery,
}: {
  account: string;
  disabled: boolean;
  onConfirm: (text: string) => Promise<boolean>;
  acceptedDelivery?: { key: string; message: string } | null;
}) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const audio = useAudioRecorder(`englow:tutor:voice:${account}`, 60);
  const [expanded, setExpanded] = useState(false);
  const [locale, setLocale] = useState("en-US");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState(false);
  const [cleanupError, setCleanupError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const generation = useRef(0);
  const locked = useRef(false);
  const attempted = useRef<{
    recordingKey: string | null;
    text: string;
    previousDeliveryKey?: string;
  } | null>(null);
  const languageKey = `englow:tutor:voice-locale:${account}`;

  // Restore only an existing transcription. Opening the page cannot spend an AI request.
  useEffect(() => {
    const key = audio.clientKey.current;
    if (!audio.blob || !key) return;
    const current = ++generation.current;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setReceipt(null);
      setText("");
      setSubmitted(false);
      setError(false);
      setUncertain(false);
      try {
        const saved = JSON.parse(sessionStorage.getItem(languageKey) ?? "null");
        if (saved?.key === key && ["en-US", "vi-VN"].includes(saved.locale))
          setLocale(saved.locale);
      } catch {
        /* Browser storage is optional. */
      }
      void audioRequest({ clientMessageId: key })
        .then((result) => {
          if (!active || current !== generation.current) return;
          if (result) {
            setReceipt(result);
            if (result.transcript) setText(result.transcript);
          }
        })
        .catch((failure) => {
          if (
            active &&
            current === generation.current &&
            !(failure instanceof AudioError && failure.status === 404)
          ) {
            setUncertain(true);
            setError(true);
          }
        });
    });
    return () => {
      active = false;
    };
  }, [audio.blob, audio.clientKey, languageKey]);

  useEffect(() => {
    if (receipt?.status !== "QUEUED" && receipt?.status !== "UPLOADING") return;
    const key = audio.clientKey.current;
    if (!key) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const until = Date.now() + 180_000;
    const poll = async () => {
      try {
        const next = await audioRequest({ clientMessageId: key });
        if (!active) return;
        if (next) {
          setReceipt(next);
          if (next.status === "READY") {
            setText(next.transcript ?? "");
            return;
          }
          if (["FAILED", "DELETED"].includes(next.status)) return;
        }
        if (Date.now() < until) timer = setTimeout(poll, 2000);
        else setError(true);
      } catch {
        if (active) setError(true);
      }
    };
    timer = setTimeout(poll, 1500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [receipt?.id, receipt?.status, audio.clientKey]);

  async function transcribe() {
    const key = audio.clientKey.current;
    if (!key || !audio.blob || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(false);
    const current = generation.current;
    try {
      let existing: Receipt | null = null;
      try {
        existing = await audioRequest({ clientMessageId: key });
      } catch (failure) {
        if (!(failure instanceof AudioError && failure.status === 404))
          throw failure;
      }
      if (!existing) {
        try {
          sessionStorage.setItem(languageKey, JSON.stringify({ key, locale }));
        } catch {
          /* memory fallback */
        }
        existing = await audioRequest(
          { clientMessageId: key, locale },
          "POST",
          audio.blob,
        );
      }
      if (current !== generation.current) return;
      setReceipt(existing);
      setUncertain(false);
      if (existing?.transcript) setText(existing.transcript);
    } catch {
      if (current === generation.current) {
        setError(true);
        setUncertain(true);
      }
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  const recordingId = receipt?.id;
  const recordingClientKey = audio.clientKey;
  const discardLocal = audio.discard;
  const remove = useCallback(async () => {
    if (recordingId) await audioRequest({ recordingId }, "DELETE");
    else if (recordingClientKey.current) {
      try {
        const existing = await audioRequest({
          clientMessageId: recordingClientKey.current,
        });
        if (existing)
          await audioRequest({ recordingId: existing.id }, "DELETE");
      } catch (failure) {
        if (!(failure instanceof AudioError && failure.status === 404))
          throw failure;
      }
    }
    if (!(await discardLocal()))
      throw new Error("Local recording could not be removed");
    try {
      sessionStorage.removeItem(languageKey);
    } catch {
      /* Storage is optional. */
    }
    setReceipt(null);
    setText("");
    setUncertain(false);
    setCleanupError(false);
    setSubmitted(false);
    attempted.current = null;
  }, [recordingId, recordingClientKey, discardLocal, languageKey]);

  useEffect(() => {
    if (
      !acceptedDelivery ||
      !attempted.current ||
      locked.current ||
      acceptedDelivery.key === attempted.current.previousDeliveryKey ||
      acceptedDelivery.message !== attempted.current.text ||
      audio.clientKey.current !== attempted.current.recordingKey
    )
      return;
    // Receipt recovery may confirm a send after the original HTTP response was lost.
    locked.current = true;
    void remove()
      .catch(() => setCleanupError(true))
      .finally(() => {
        locked.current = false;
      });
  }, [acceptedDelivery, audio.clientKey, remove]);

  async function discard() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      await remove();
    } catch {
      setCleanupError(true);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function retryTranscription() {
    if (locked.current || receipt?.status !== "FAILED" || disabled) return;
    locked.current = true;
    setBusy(true);
    setError(false);
    let renewed = false;
    try {
      await audioRequest({ recordingId: receipt.id }, "DELETE");
      renewed = !!(await audio.renewClientKey());
      if (renewed) {
        setReceipt(null);
        setText("");
        setUncertain(false);
      }
    } catch {
      setError(true);
    } finally {
      locked.current = false;
      setBusy(false);
    }
    if (renewed) await transcribe();
  }
  async function confirm() {
    if (
      locked.current ||
      disabled ||
      submitted ||
      !text.trim() ||
      text.length > 4000
    )
      return;
    locked.current = true;
    setBusy(true);
    setError(false);
    try {
      attempted.current = {
        recordingKey: audio.clientKey.current,
        text: text.trim(),
        previousDeliveryKey: acceptedDelivery?.key,
      };
      if (await onConfirm(text.trim())) {
        setSubmitted(true);
        try {
          await remove();
        } catch {
          setCleanupError(true);
        }
      }
    } catch {
      setError(true);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const queued =
    receipt?.status === "QUEUED" || receipt?.status === "UPLOADING";
  return (
    <Stack gap="xs">
      <Button
        variant="subtle"
        mih={44}
        leftSection={<IconMicrophone size={18} />}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {tr(
          "Hỏi bằng giọng nói · tối đa 1 phút",
          "Ask by voice · up to 1 minute",
        )}
      </Button>
      {(expanded || audio.blob || audio.recording) && (
        <Card withBorder radius="md" p="md">
          <Stack gap="sm">
            <Text size="sm">
              {tr(
                "Nghe lại và kiểm tra bản phiên âm trước khi gửi. Một lượt phiên âm sử dụng một lượt AI; đây không phải chấm điểm phát âm.",
                "Review your recording and transcript before sending. Transcription uses one AI request; it does not grade pronunciation.",
              )}
            </Text>
            <Group align="flex-end">
              <Select
                label={tr("Ngôn ngữ nói", "Spoken language")}
                value={locale}
                onChange={(value) => setLocale(value ?? "en-US")}
                data={[
                  { value: "en-US", label: "English" },
                  { value: "vi-VN", label: "Tiếng Việt" },
                ]}
                allowDeselect={false}
                disabled={
                  busy ||
                  queued ||
                  !!receipt ||
                  uncertain ||
                  audio.recording ||
                  audio.preparing
                }
              />
              {audio.recording ? (
                <Button
                  color="red"
                  mih={44}
                  leftSection={<IconPlayerStop size={18} />}
                  onClick={audio.stop}
                >
                  {tr("Dừng ghi âm", "Stop recording")} · {audio.seconds}/60s
                </Button>
              ) : (
                <Button
                  variant="light"
                  mih={44}
                  loading={audio.preparing}
                  disabled={disabled || busy || !!audio.blob}
                  onClick={() => void audio.start()}
                  leftSection={<IconMicrophone size={18} />}
                >
                  {tr("Bắt đầu ghi âm", "Start recording")}
                </Button>
              )}
            </Group>
            {audio.url && (
              <audio
                controls
                src={audio.url}
                aria-label={tr(
                  "Nghe lại câu hỏi đã ghi",
                  "Review recorded question",
                )}
                style={{ width: "100%" }}
              />
            )}
            {audio.error && (
              <Alert color="orange" role="alert">
                {audio.error}
              </Alert>
            )}
            {audio.storageError && (
              <Alert color="orange">
                {tr(
                  "Không lưu được bản ghi trên thiết bị. Giữ trang mở đến khi hoàn tất.",
                  "Your browser could not save this recording. Keep this page open until you finish.",
                )}
              </Alert>
            )}
            {queued && (
              <Text role="status" size="sm">
                {tr(
                  "Đang phiên âm. Bạn có thể chờ tại đây; bản ghi vẫn được giữ.",
                  "Transcribing. Your recording is retained while you wait.",
                )}
              </Text>
            )}
            {receipt?.status === "FAILED" && (
              <Alert color="orange">
                {tr(
                  "Chưa nhận dạng được bản ghi. Bạn có thể thử phiên âm lại bản đang giữ, ghi lại hoặc nhập câu hỏi.",
                  "Transcription failed. Retry the retained recording, record again, or type your question.",
                )}
              </Alert>
            )}
            {error && (
              <Alert color="orange" role="alert">
                {tr(
                  "Chưa xác nhận được kết quả. Bản ghi được giữ; kiểm tra lại sẽ dùng cùng mã yêu cầu.",
                  "Could not confirm the result. Your recording is retained; checking again uses the same request ID.",
                )}
              </Alert>
            )}
            {cleanupError && (
              <Alert color="orange" role="alert">
                {tr(
                  "Chưa xóa xong bản ghi. Bấm Xóa bản ghi để thử lại. Nếu đã gửi câu hỏi, không cần gửi lần nữa.",
                  "Recording cleanup failed. Use Discard recording to retry. If your question was sent, do not send it again.",
                )}
              </Alert>
            )}
            {receipt?.status === "READY" && !submitted && (
              <>
                <Textarea
                  label={tr(
                    "Kiểm tra và sửa bản phiên âm",
                    "Review and edit transcript",
                  )}
                  value={text}
                  onChange={(event) => setText(event.currentTarget.value)}
                  autosize
                  minRows={2}
                  maxRows={6}
                  maxLength={4000}
                  disabled={busy}
                />
                <Button
                  mih={44}
                  disabled={disabled || !text.trim()}
                  loading={busy}
                  onClick={() => void confirm()}
                >
                  {tr("Xác nhận và gửi cho Tutor", "Confirm and send to Tutor")}
                </Button>
              </>
            )}
            {audio.blob && (
              <Group>
                {receipt?.status === "FAILED" && (
                  <Button
                    variant="light"
                    mih={44}
                    loading={busy}
                    disabled={disabled}
                    onClick={() => void retryTranscription()}
                  >
                    {tr(
                      "Phiên âm lại · một lượt AI mới",
                      "Retry transcription · one new AI request",
                    )}
                  </Button>
                )}
                {!submitted &&
                  !["READY", "FAILED", "DELETED"].includes(
                    receipt?.status ?? "",
                  ) && (
                    <Button
                      variant="light"
                      mih={44}
                      loading={busy}
                      disabled={disabled || audio.preparing}
                      onClick={() => void transcribe()}
                    >
                      {queued || uncertain
                        ? tr("Kiểm tra kết quả", "Check result")
                        : tr("Phiên âm bản ghi", "Transcribe recording")}
                    </Button>
                  )}
                <Button
                  variant="subtle"
                  color="red"
                  mih={44}
                  leftSection={<IconTrash size={18} />}
                  disabled={busy || audio.recording || audio.preparing}
                  onClick={() => void discard()}
                >
                  {tr("Xóa bản ghi", "Discard recording")}
                </Button>
              </Group>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
