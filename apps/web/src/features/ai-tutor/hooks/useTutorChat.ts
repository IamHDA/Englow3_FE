"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TutorMessageStatus } from "@/lib/graphql/generated/schemaTypes";
import {
  useSendTutorMessageMutation,
  useTutorConversationLazyQuery,
} from "@/lib/graphql/generated/hooks";

import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from "../constants/tutorChat";
import type { TutorMessage } from "../types";

/**
 * Một cuộc hội thoại với gia sư.
 *
 * Hỏi thì đồng bộ, trả lời thì không: câu hỏi được lưu và đưa vào hàng đợi,
 * còn màn hình hỏi lại lượt đang chờ. Giữ một request mở suốt thời gian nhà
 * cung cấp suy nghĩ thì chiếm một thread đúng chừng ấy lâu mà chẳng được gì.
 */
export function useTutorChat(initialConversationId?: string) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sendMessage] = useSendTutorMessageMutation();
  const [fetchConversation] = useTutorConversationLazyQuery({
    fetchPolicy: "network-only",
  });

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartedAt = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    pollStartedAt.current = null;
  }, []);

  // Dọn khi rời màn hình, nếu không thì timer vẫn chạy trên một component đã
  // gỡ và mỗi lần vào lại sẽ chồng thêm một vòng hỏi nữa.
  useEffect(() => stopPolling, [stopPolling]);

  /**
   * Hỏi một lần. Trả về true nếu còn lượt đang chờ, tức là còn phải hỏi tiếp.
   *
   * Tách riêng khỏi vòng lặp để không phải tự gọi chính nó - một hàm nằm trong
   * danh sách phụ thuộc của chính nó thì không bao giờ ổn định.
   */
  const pollOnce = useCallback(
    async (id: string) => {
      const { data } = await fetchConversation({ variables: { id } });
      const next = data?.tutorConversation.messages ?? [];
      if (next.length > 0) {
        setMessages(next);
      }

      return next.some(
        (message) => message.status === TutorMessageStatus.PENDING,
      );
    },
    [fetchConversation],
  );

  const poll = useCallback(
    async (id: string) => {
      stopPolling();
      pollStartedAt.current = Date.now();

      try {
        if (!(await pollOnce(id))) {
          return;
        }
      } catch {
        setError("Không lấy được câu trả lời. Kiểm tra kết nối rồi thử lại.");
        return;
      }

      pollTimer.current = setInterval(() => {
        void (async () => {
          try {
            if (!(await pollOnce(id))) {
              stopPolling();
              return;
            }
            if (Date.now() - (pollStartedAt.current ?? 0) > POLL_TIMEOUT_MS) {
              stopPolling();
              // Câu trả lời vẫn có thể về sau - hàng đợi chưa bỏ cuộc - nên
              // nói rõ là "mở lại sau", đừng nói là hỏng.
              setError(
                "Gia sư trả lời lâu hơn thường lệ. Bạn mở lại cuộc trò chuyện này sau nhé.",
              );
            }
          } catch {
            stopPolling();
            setError(
              "Không lấy được câu trả lời. Kiểm tra kết nối rồi thử lại.",
            );
          }
        })();
      }, POLL_INTERVAL_MS);
    },
    [pollOnce, stopPolling],
  );

  const open = useCallback(
    async (id: string) => {
      setError(null);
      setConversationId(id);
      setMessages([]);
      stopPolling();
      await poll(id);
    },
    [poll, stopPolling],
  );

  const send = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || sending) {
        return;
      }

      setSending(true);
      setError(null);
      try {
        const { data } = await sendMessage({
          variables: { conversationId, message: trimmed },
        });
        const result = data?.sendTutorMessage;
        if (!result) {
          throw new Error("no result");
        }

        setConversationId(result.conversation.id);
        // Mutation chỉ trả về hai lượt vừa tạo, không phải cả cuộc hội thoại,
        // nên nối vào thay vì thay thế - nếu không, lịch sử biến mất ngay khi
        // gửi câu thứ hai.
        setMessages((previous) => [...previous, ...result.messages]);

        stopPolling();
        await poll(result.conversation.id);
      } catch {
        setError("Không gửi được câu hỏi. Thử lại giúp mình nhé.");
      } finally {
        setSending(false);
      }
    },
    [conversationId, poll, sendMessage, sending, stopPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setConversationId(undefined);
    setMessages([]);
    setError(null);
  }, [stopPolling]);

  return {
    conversationId,
    messages,
    sending,
    error,
    waiting: messages.some(
      (message) => message.status === TutorMessageStatus.PENDING,
    ),
    send,
    open,
    reset,
  };
}
