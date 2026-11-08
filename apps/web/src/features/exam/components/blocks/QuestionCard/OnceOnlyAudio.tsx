"use client";

import { Alert, Button, Group, Progress, Stack, Text } from "@mantine/core";
import { Headphones } from "lucide-react";
import React, { useRef, useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

const STORAGE_PREFIX = "englow3_exam_audio_played_";
const INTERRUPTED_PREFIX = "englow3_exam_audio_interrupted_";

function readInterrupted(attemptId: string, audioId: string): number | null {
  try {
    const raw = sessionStorage.getItem(
      INTERRUPTED_PREFIX + attemptId + ":" + audioId,
    );
    if (raw === null) return null;
    const value: unknown = JSON.parse(raw);
    return typeof value === "number" && Number.isFinite(value) && value >= 0
      ? value
      : null;
  } catch {
    return null;
  }
}

function rememberInterruption(
  attemptId: string,
  audioId: string,
  position: number | null,
) {
  try {
    const key = INTERRUPTED_PREFIX + attemptId + ":" + audioId;
    if (position === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(position));
  } catch {
    // In restricted browsers recovery remains available while this player is mounted.
  }
}

function readPlayed(attemptId: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + attemptId);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(
      Array.isArray(list) ? list.filter((x) => typeof x === "string") : [],
    );
  } catch {
    return new Set();
  }
}

function markPlayed(attemptId: string, audioId: string) {
  try {
    const played = readPlayed(attemptId);
    played.add(audioId);
    sessionStorage.setItem(
      STORAGE_PREFIX + attemptId,
      JSON.stringify([...played]),
    );
  } catch {
    // Storage can be unavailable; the clip is still single-play for this page view.
  }
}

/**
 * Âm thanh của bài thi thật: một lần duy nhất, không tua, không tạm dừng, không
 * phát lại - như phòng thi. Chỉ đánh dấu đã nghe khi âm thanh thực sự bắt đầu,
 * kể cả khi tải lại trang giữa chừng; lỗi tải trước đó vẫn được thử lại.
 * Trạng thái "đã nghe" được nhớ theo lượt thi chứ không theo trạng thái trình
 * duyệt. Bài luyện tập dùng trình phát thường.
 */
export function OnceOnlyAudio({
  src,
  audioId,
  attemptId,
  label,
}: {
  src: string;
  /** Định danh ổn định của đoạn âm thanh (URL ký sẵn đổi mỗi lần tải nên không dùng được). */
  audioId: string;
  attemptId: string;
  label: string;
}) {
  const { isVi } = useLanguage();
  const audio = useRef<HTMLAudioElement>(null);
  const [interrupted] = useState(() => readInterrupted(attemptId, audioId));
  const started = useRef(false);
  const resumeAt = useRef(interrupted ?? 0);
  // Đoạn đã được mở ở lần trước (kể cả trước khi tải lại trang) thì không nghe lại
  // được. Đọc một lần lúc dựng; đổi sang đoạn khác thì cha dựng lại bằng `key`.
  const [state, setState] = useState<
    "ready" | "loading" | "playing" | "error" | "done"
  >(() =>
    interrupted !== null
      ? "error"
      : readPlayed(attemptId).has(audioId)
        ? "done"
        : "ready",
  );
  const [progress, setProgress] = useState(0);

  const play = () => {
    const element = audio.current;
    if (!element || (state !== "ready" && state !== "error")) return;
    if (state === "error") element.load();
    setState("loading");
    void element.play().catch(() => {
      rememberInterruption(attemptId, audioId, resumeAt.current);
      setState("error");
    });
  };

  return (
    <Stack gap="xs">
      <Group gap="sm" wrap="nowrap" align="center">
        {/* Không có `controls`: người thi không có nút tạm dừng, tua hay phát lại. */}
        <audio
          ref={audio}
          preload="none"
          src={src}
          controlsList="nodownload noplaybackrate"
          onContextMenu={(event) => event.preventDefault()}
          onTimeUpdate={(event) => {
            const { currentTime, duration } = event.currentTarget;
            resumeAt.current = Math.max(resumeAt.current, currentTime);
            if (duration > 0) setProgress((currentTime / duration) * 100);
          }}
          onLoadedMetadata={(event) => {
            if (resumeAt.current > 0)
              event.currentTarget.currentTime = resumeAt.current;
          }}
          onPlaying={() => {
            rememberInterruption(attemptId, audioId, null);
            if (!started.current) {
              started.current = true;
              markPlayed(attemptId, audioId);
            }
            setState("playing");
          }}
          onEnded={() => {
            rememberInterruption(attemptId, audioId, null);
            setState("done");
          }}
          onError={() => {
            if (state !== "done") {
              resumeAt.current = Math.max(
                resumeAt.current,
                audio.current?.currentTime ?? 0,
              );
              rememberInterruption(attemptId, audioId, resumeAt.current);
              setState("error");
            }
          }}
        />
        <Button
          size="xs"
          variant={state === "ready" ? "filled" : "light"}
          color="navy"
          leftSection={<Headphones size={14} />}
          disabled={state !== "ready" && state !== "error"}
          loading={state === "loading"}
          onClick={play}
        >
          {state === "error"
            ? isVi
              ? "Thử phát lại"
              : "Retry audio"
            : state === "ready" || state === "loading"
              ? isVi
                ? "Phát (chỉ nghe một lần)"
                : "Play (one listen only)"
              : state === "playing"
                ? isVi
                  ? "Đang phát…"
                  : "Playing…"
                : isVi
                  ? "Đã nghe"
                  : "Played"}
        </Button>
        <Progress
          value={state === "done" ? 100 : progress}
          size="sm"
          style={{ flex: 1 }}
          aria-label={label}
        />
        {state === "ready" && (
          <Text size="xs" c="dimmed">
            {isVi ? "Không thể nghe lại" : "No replays"}
          </Text>
        )}
      </Group>
      {state === "error" && (
        <Alert color="red" role="alert">
          {isVi
            ? "Không phát được âm thanh. Kiểm tra kết nối rồi thử lại; nếu đã nghe một phần, âm thanh sẽ tiếp tục từ chỗ bị gián đoạn."
            : "Audio could not play. Check your connection and retry; if playback had started, it continues from where it stopped."}
        </Alert>
      )}
    </Stack>
  );
}
