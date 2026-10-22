"use client";
import { useEffect, useRef } from "react";
import { useHeartbeatExamAttemptMutation } from "@/lib/graphql/generated/hooks";

/** Mỗi chừng này giây, trình duyệt báo "tôi vẫn ở bài thi này". Ngắn hơn nhiều so với thời gian ân hạn của backend (2 phút). */
export const PRESENCE_INTERVAL_MS = 30_000;

/**
 * Báo cho backend rằng người thi vẫn còn ở một lượt thi thật. Bài thi thật mà bị
 * bỏ dở thì kết thúc: backend chấm phần đã lưu sau thời gian ân hạn không nghe tín
 * hiệu nào. Tải lại trang trong thời gian ân hạn vẫn tiếp tục được.
 *
 * `onEnded` chạy khi backend nói lượt thi không còn mở - màn hình đã ngủ quá lâu.
 * Lỗi mạng không phải là lý do để kết thúc: chỉ câu trả lời "đã đóng" của backend mới tính.
 */
export function useExamPresence(
  attemptId: string | null,
  enabled: boolean,
  onEnded: () => void,
) {
  const [heartbeat] = useHeartbeatExamAttemptMutation();
  const ended = useRef(onEnded);
  useEffect(() => {
    ended.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (!attemptId || !enabled) return;
    let stopped = false;
    const beat = async () => {
      if (stopped) return;
      const response = await heartbeat({ variables: { attemptId } }).catch(
        () => null,
      );
      if (stopped || !response?.data) return;
      if (response.data.heartbeatExamAttempt === false) {
        stopped = true;
        ended.current();
      }
    };
    void beat();
    const timer = setInterval(() => void beat(), PRESENCE_INTERVAL_MS);
    // Quay lại tab sau một lúc: báo ngay, không chờ nhịp kế tiếp.
    const onVisible = () => {
      if (document.visibilityState === "visible") void beat();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [attemptId, enabled, heartbeat]);
}
