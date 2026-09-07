'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TIMER_WARNING_THRESHOLD_SECONDS,
  TIMER_CRITICAL_THRESHOLD_SECONDS,
} from '../constants/examSitting';

interface UseExamTimerOptions {
  durationSeconds: number;
  isActive: boolean;
  onExpire?: () => void;
}

export function useExamTimer({
  durationSeconds,
  isActive,
  onExpire,
}: UseExamTimerOptions) {
  // Target deadline timestamp (ms since epoch)
  const deadlineRef = useRef<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(durationSeconds);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const startTimestampRef = useRef<number | null>(null);

  // Initialize or reset deadline when activated
  useEffect(() => {
    if (isActive && deadlineRef.current === null) {
      const now = Date.now();
      deadlineRef.current = now + durationSeconds * 1000;
      startTimestampRef.current = now;
      setRemainingSeconds(durationSeconds);
    }
  }, [isActive, durationSeconds]);

  // Re-derives remaining time from target deadline
  const updateTimer = useCallback(() => {
    if (!deadlineRef.current || !startTimestampRef.current || !isActive) return;

    const now = Date.now();
    const remainingMs = deadlineRef.current - now;
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
    const spentSec = Math.floor((now - startTimestampRef.current) / 1000);

    setRemainingSeconds(remainingSec);
    setTimeSpentSeconds(spentSec);

    if (remainingSec <= 0) {
      deadlineRef.current = null;
      onExpire?.();
    }
  }, [isActive, onExpire]);

  // Main 1-second interval
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isActive, updateTimer]);

  // Tab focus & visibility change handler to prevent clock skew on sleeping laptops or background tabs
  useEffect(() => {
    if (!isActive) return;

    const handleFocus = () => {
      updateTimer();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTimer();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, updateTimer]);

  const reset = useCallback(() => {
    deadlineRef.current = null;
    startTimestampRef.current = null;
    setRemainingSeconds(durationSeconds);
    setTimeSpentSeconds(0);
  }, [durationSeconds]);

  // Format HH:MM:SS or MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isWarning = remainingSeconds <= TIMER_WARNING_THRESHOLD_SECONDS;
  const isCritical = remainingSeconds <= TIMER_CRITICAL_THRESHOLD_SECONDS;

  return {
    remainingSeconds,
    timeSpentSeconds,
    formattedTime: formatTime(remainingSeconds),
    isWarning,
    isCritical,
    reset,
  };
}
