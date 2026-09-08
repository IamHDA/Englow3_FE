"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseDictationAudioOptions {
  textToSpeak: string;
  durationSeconds?: number;
}

export function useDictationAudio({
  textToSpeak,
  durationSeconds = 5,
}: UseDictationAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [replayCount, setReplayCount] = useState(0);

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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [stopTimer]);

  const playAudio = useCallback(() => {
    if (typeof window === "undefined") return;

    stopAudio();
    setIsPlaying(true);
    setCurrentTime(0);
    startTimeRef.current = Date.now();

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "en-US";
      utterance.rate = playbackSpeed;

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentTime(durationRef.current);
        stopTimer();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        stopTimer();
      };

      window.speechSynthesis.speak(utterance);
    }

    // Interval to simulate timer & waveform progression
    const intervalMs = 100;
    const totalMs = (durationRef.current * 1000) / playbackSpeed;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(durationRef.current, (elapsed / totalMs) * durationRef.current);
      setCurrentTime(progress);

      if (elapsed >= totalMs) {
        setIsPlaying(false);
        setCurrentTime(durationRef.current);
        stopTimer();
      }
    }, intervalMs);
  }, [playbackSpeed, stopAudio, stopTimer, textToSpeak]);

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
