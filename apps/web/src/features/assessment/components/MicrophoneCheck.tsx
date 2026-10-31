"use client";
import { Alert, Button, Group, Progress, Stack, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function MicrophoneCheck({ disabled }: { disabled: boolean }) {
  const { isVi } = useLanguage();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState(false);
  const resource = useRef<{
    media: MediaStream;
    context: AudioContext;
    timer: ReturnType<typeof setInterval>;
  } | null>(null);
  const generation = useRef(0);
  function release() {
    const current = resource.current;
    resource.current = null;
    if (!current) return;
    clearInterval(current.timer);
    current.media.getTracks().forEach((track) => track.stop());
    void current.context.close().catch(() => {});
  }
  useEffect(
    () => () => {
      generation.current++;
      release();
    },
    [],
  );
  useEffect(() => {
    if (!disabled) return;
    generation.current++;
    release();
    let live = true;
    void Promise.resolve().then(() => {
      if (live) {
        setActive(false);
        setBusy(false);
        setLevel(0);
      }
    });
    return () => {
      live = false;
    };
  }, [disabled]);
  async function check() {
    if (busy) return;
    if (resource.current) {
      generation.current++;
      release();
      setActive(false);
      setLevel(0);
      return;
    }
    const expected = ++generation.current;
    setBusy(true);
    setError(false);
    let media: MediaStream | null = null;
    let context: AudioContext | null = null;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (expected !== generation.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      context = new AudioContext();
      await context.resume();
      if (expected !== generation.current) {
        media.getTracks().forEach((track) => track.stop());
        await context.close();
        return;
      }
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(media).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      const timer = setInterval(() => {
        analyser.getByteTimeDomainData(samples);
        const rms = Math.sqrt(
          samples.reduce((sum, n) => sum + ((n - 128) / 128) ** 2, 0) /
            samples.length,
        );
        setLevel(Math.min(100, Math.round(rms * 400)));
      }, 100);
      resource.current = { media, context, timer };
      setActive(true);
    } catch {
      media?.getTracks().forEach((track) => track.stop());
      if (context) void context.close().catch(() => {});
      if (expected === generation.current) setError(true);
    } finally {
      if (expected === generation.current) setBusy(false);
    }
  }
  return (
    <Stack gap="xs">
      <Group>
        <Button
          variant="light"
          disabled={disabled}
          loading={busy}
          onClick={() => void check()}
        >
          {active && !disabled
            ? isVi
              ? "Dừng kiểm tra micro"
              : "Stop microphone check"
            : isVi
              ? "Kiểm tra micro"
              : "Check microphone"}
        </Button>
        <Text size="sm" c="dimmed">
          {isVi
            ? "Nói một câu và kiểm tra vạch âm lượng trước khi ghi."
            : "Say a sentence and check the level before recording."}
        </Text>
      </Group>
      {active && !disabled && (
        <>
          <Progress
            value={level}
            aria-label={isVi ? "Âm lượng micro" : "Microphone level"}
          />
          <Text size="sm" role="status">
            {isVi
              ? "Chế độ kiểm tra đang bật; âm thanh không được lưu hay gửi."
              : "Microphone check is active; audio is not saved or sent."}
          </Text>
        </>
      )}
      {error && (
        <Alert color="orange">
          {isVi
            ? "Không mở được micro. Cho phép quyền micro, kiểm tra thiết bị rồi thử lại."
            : "Could not open the microphone. Allow microphone access, check your device and retry."}
        </Alert>
      )}
    </Stack>
  );
}
