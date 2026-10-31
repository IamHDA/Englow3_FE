"use client";

import { Button, Group, Progress, Text } from "@mantine/core";
import { Headphones } from "lucide-react";
import React, { useRef, useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

const STORAGE_PREFIX = "englow3_exam_audio_played_";

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
 * phát lại - như phòng thi. Bấm phát là đã nghe, kể cả khi tải lại trang giữa
 * chừng, nên "đã nghe" được nhớ theo lượt thi chứ không theo trạng thái trình
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
  // Đoạn đã được mở ở lần trước (kể cả trước khi tải lại trang) thì không nghe lại
  // được. Đọc một lần lúc dựng; đổi sang đoạn khác thì cha dựng lại bằng `key`.
  const [state, setState] = useState<"ready" | "playing" | "done">(() =>
    readPlayed(attemptId).has(audioId) ? "done" : "ready",
  );
  const [progress, setProgress] = useState(0);

  const play = () => {
    const element = audio.current;
    if (!element || state !== "ready") return;
    markPlayed(attemptId, audioId);
    setState("playing");
    void element.play().catch(() => setState("done"));
  };

  return (
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
          if (duration > 0) setProgress((currentTime / duration) * 100);
        }}
        onEnded={() => setState("done")}
        onError={() => setState("done")}
      />
      <Button
        size="xs"
        variant={state === "ready" ? "filled" : "light"}
        color="navy"
        leftSection={<Headphones size={14} />}
        disabled={state !== "ready"}
        onClick={play}
      >
        {state === "ready"
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
  );
}
