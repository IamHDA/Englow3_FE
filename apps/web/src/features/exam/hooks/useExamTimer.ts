"use client";

import { useEffect, useReducer, useRef } from "react";
import {
  TIMER_WARNING_THRESHOLD_SECONDS,
  TIMER_CRITICAL_THRESHOLD_SECONDS,
} from "../constants/examSitting";

interface UseExamTimerOptions {
  /**
   * Hạn nộp do backend cấp cùng lượt thi (ISO-8601). Đây là nguồn duy nhất
   * quyết định còn bao nhiêu thời gian - đếm lùi từ `durationSeconds` sẽ lệch
   * khi máy ngủ, tab bị treo hoặc đồng hồ máy sai, và quan trọng hơn là nó
   * không khớp với mốc backend dùng để từ chối bài nộp muộn.
   *
   * null khi chưa mở lượt thi nào.
   */
  expiresAt: string | null;
  isActive: boolean;
  onExpire?: () => void;
}

function secondsUntil(deadlineMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
}

export function useExamTimer({
  expiresAt,
  isActive,
  onExpire,
}: UseExamTimerOptions) {
  const deadlineMs = expiresAt === null ? null : Date.parse(expiresAt);

  // Thời gian còn lại được tính lúc render từ hạn nộp, không giữ trong state:
  // state sẽ cũ đi mỗi khi `expiresAt` đổi (mở lượt mới), còn cách này thì
  // không bao giờ lệch. `tick` chỉ để kéo một lượt render mỗi giây.
  const [, tick] = useReducer((count: number) => count + 1, 0);
  const remainingSeconds = deadlineMs === null ? 0 : secondsUntil(deadlineMs);

  const running = isActive && deadlineMs !== null;

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [running]);

  // Quay lại tab hoặc mở nắp máy: vẽ lại ngay thay vì đợi nhịp kế tiếp, vì
  // trình duyệt bóp nhịp interval của tab chạy nền.
  useEffect(() => {
    if (!running) return;

    const handleFocus = () => tick();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [running]);

  // Hết giờ chỉ được báo một lần: `onExpire` nộp bài, gọi lần hai sẽ nộp chồng
  // lên một lượt đã đóng.
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
  }, [expiresAt]);

  useEffect(() => {
    if (!running || remainingSeconds > 0 || expiredRef.current) return;

    expiredRef.current = true;
    onExpire?.();
  }, [running, remainingSeconds, onExpire]);

  // Format HH:MM:SS or MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isWarning: remainingSeconds <= TIMER_WARNING_THRESHOLD_SECONDS,
    isCritical: remainingSeconds <= TIMER_CRITICAL_THRESHOLD_SECONDS,
  };
}
