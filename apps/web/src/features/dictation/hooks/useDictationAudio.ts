"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseDictationAudioOptions {
  /**
   * Bản ghi của câu, ký sẵn và ngắn hạn. Trước đây hook này đọc transcript bằng
   * speech synthesis - nghĩa là trình duyệt phải có sẵn đáp án để nói ra nó.
   * Giờ nó phát đúng file, nên đáp án không còn cần tới phía client.
   */
  audioUrl: string | null;
  durationSeconds?: number;
}

export function useDictationAudio({
  audioUrl,
  durationSeconds = 5,
}: UseDictationAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [replayCount, setReplayCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(durationSeconds);

  useEffect(() => {
    durationRef.current = durationSeconds;
  }, [durationSeconds]);

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
      audioRef.current.currentTime = 0;
    }
  }, [stopTimer]);

  const playAudio = useCallback(() => {
    if (typeof window === "undefined") return;

    stopAudio();
    setIsPlaying(true);
    setCurrentTime(0);
    startTimeRef.current = Date.now();

    if (audioUrl) {
      // Dựng phần tử mới mỗi lượt phát rồi mới gắn vào ref: sửa một giá trị
      // đọc ra từ ref là thứ React Compiler cấm, và phần tử cũ đã bị dừng ở
      // `stopAudio` phía trên.
      const element = new Audio(audioUrl);
      element.playbackRate = playbackSpeed;

      element.onended = () => {
        setIsPlaying(false);
        setCurrentTime(durationRef.current);
        stopTimer();
      };

      element.onerror = () => {
        setIsPlaying(false);
        stopTimer();
      };

      audioRef.current = element;
      void element.play().catch(() => {
        // Trình duyệt chặn phát tự động: giữ nguyên trạng thái dừng thay vì
        // hiện thanh tiến trình chạy trong im lặng.
        setIsPlaying(false);
        stopTimer();
      });
    }

    // Interval to simulate timer & waveform progression
    const intervalMs = 100;
    const totalMs = (durationRef.current * 1000) / playbackSpeed;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(
        durationRef.current,
        (elapsed / totalMs) * durationRef.current,
      );
      setCurrentTime(progress);

      if (elapsed >= totalMs) {
        setIsPlaying(false);
        setCurrentTime(durationRef.current);
        stopTimer();
      }
    }, intervalMs);
  }, [playbackSpeed, stopAudio, stopTimer, audioUrl]);

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

  const back5 = useCallback(() => {
    setCurrentTime((prev) => Math.max(0, prev - 5));
  }, []);

  const forward5 = useCallback(() => {
    setCurrentTime((prev) => Math.min(durationRef.current, prev + 5));
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    currentTime,
    duration: durationSeconds,
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
