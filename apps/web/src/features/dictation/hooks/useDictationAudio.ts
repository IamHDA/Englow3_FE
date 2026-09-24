"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseDictationAudioOptions {
  /**
   * Bản ghi, ký sẵn và ngắn hạn. Trước đây hook này đọc transcript bằng speech
   * synthesis - nghĩa là trình duyệt phải có sẵn đáp án để nói ra nó. Giờ nó
   * phát đúng file, nên đáp án không còn cần tới phía client.
   */
  audioUrl: string | null;
  durationSeconds?: number;
  /**
   * Câu này nằm ở đoạn nào trong file, với bài cắt từ một bản ghi dài.
   *
   * Null cả hai nghĩa là file chính là câu này - đúng như mọi bài có một clip
   * mỗi dòng vẫn vậy. Nên bài cũ không đổi gì, và bài nhập từ shadowing batch
   * phát đúng đoạn của nó thay vì cả đoạn văn.
   */
  audioStartMs?: number | null;
  audioEndMs?: number | null;
}

/** Nhịp cập nhật khi không có audio thật để bám theo. */
const FALLBACK_TICK_MS = 100;

export function useDictationAudio({
  audioUrl,
  durationSeconds = 5,
  audioStartMs = null,
  audioEndMs = null,
}: UseDictationAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [replayCount, setReplayCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef<number>(0);

  /** Cửa sổ của câu, tính bằng giây. Chỉ có khi cả hai mốc cùng có. */
  const window_ = useMemo(() => {
    if (
      audioStartMs == null ||
      audioEndMs == null ||
      audioEndMs <= audioStartMs
    ) {
      return null;
    }
    return { start: audioStartMs / 1000, end: audioEndMs / 1000 };
  }, [audioStartMs, audioEndMs]);

  // Độ dài người nghe thực sự nghe. Với một câu cắt ra từ đoạn văn, đó là độ
  // dài của câu chứ không phải của cả bản ghi - hiện cả bản ghi thì thanh tiến
  // trình gần như đứng yên suốt.
  const duration = window_ ? window_.end - window_.start : durationSeconds;
  const durationRef = useRef(duration);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    stopTimer();
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentTime(0);
  }, [stopTimer]);

  const playFrom = useCallback(
    (offsetSeconds: number) => {
      if (typeof window === "undefined") return;

      stopAudio();
      setIsPlaying(true);
      setCurrentTime(offsetSeconds);

      if (!audioUrl) {
        // Không có file: giữ lại thanh tiến trình chạy theo đồng hồ, vì đó là
        // phản hồi duy nhất còn lại cho người học.
        startedAtRef.current =
          Date.now() - (offsetSeconds * 1000) / playbackSpeed;
        timerRef.current = setInterval(() => {
          const elapsed =
            ((Date.now() - startedAtRef.current) / 1000) * playbackSpeed;
          if (elapsed >= durationRef.current) {
            setCurrentTime(durationRef.current);
            setIsPlaying(false);
            stopTimer();
            return;
          }
          setCurrentTime(elapsed);
        }, FALLBACK_TICK_MS);
        return;
      }

      // Dựng phần tử mới mỗi lượt phát rồi mới gắn vào ref: sửa một giá trị
      // đọc ra từ ref là thứ React Compiler cấm, và phần tử cũ đã bị dừng ở
      // `stopAudio` phía trên.
      const element = new Audio(audioUrl);
      element.playbackRate = playbackSpeed;
      element.currentTime = (window_?.start ?? 0) + offsetSeconds;

      // Thời gian lấy từ chính phần tử audio, không phải từ đồng hồ. Đồng hồ
      // trôi khỏi âm thanh ngay khi file tải chậm hoặc trình duyệt đổi tốc độ,
      // và với một cửa sổ thì nó còn phải biết dừng ở đâu.
      element.ontimeupdate = () => {
        const played = element.currentTime - (window_?.start ?? 0);
        if (window_ && element.currentTime >= window_.end) {
          element.pause();
          setCurrentTime(durationRef.current);
          setIsPlaying(false);
          return;
        }
        setCurrentTime(Math.max(0, played));
      };

      element.onended = () => {
        setCurrentTime(durationRef.current);
        setIsPlaying(false);
      };

      element.onerror = () => {
        setIsPlaying(false);
      };

      audioRef.current = element;
      void element.play().catch(() => {
        // Trình duyệt chặn phát tự động: giữ nguyên trạng thái dừng thay vì
        // hiện thanh tiến trình chạy trong im lặng.
        setIsPlaying(false);
      });
    },
    [audioUrl, playbackSpeed, stopAudio, stopTimer, window_],
  );

  const playAudio = useCallback(() => playFrom(0), [playFrom]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, stopAudio]);

  const replay = useCallback(() => {
    setReplayCount((prev) => prev + 1);
    playAudio();
  }, [playAudio]);

  /**
   * Tua thật, không chỉ đổi con số.
   *
   * Trước đây hai nút này chỉ dịch giá trị hiển thị, nên người học bấm "lùi 5
   * giây" và nghe tiếp đúng chỗ cũ trong khi đồng hồ nhảy lùi.
   */
  const seekBy = useCallback(
    (deltaSeconds: number) => {
      const next = Math.min(
        durationRef.current,
        Math.max(0, currentTime + deltaSeconds),
      );
      if (audioRef.current) {
        audioRef.current.currentTime = (window_?.start ?? 0) + next;
        setCurrentTime(next);
        return;
      }
      playFrom(next);
    },
    [currentTime, playFrom, window_],
  );

  const back5 = useCallback(() => seekBy(-5), [seekBy]);
  const forward5 = useCallback(() => seekBy(5), [seekBy]);

  const changeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    replayCount,
    togglePlay,
    replay,
    back5,
    forward5,
    changeSpeed,
    stopAudio,
  };
}
