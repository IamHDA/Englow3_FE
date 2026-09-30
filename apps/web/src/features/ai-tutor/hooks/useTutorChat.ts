"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TutorMessageStatus } from "@/lib/graphql/generated/schemaTypes";
import {
  useSendTutorMessageMutation,
  useTutorConversationLazyQuery,
} from "@/lib/graphql/generated/hooks";

import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from "../constants/tutorChat";
import type { TutorMessage } from "../types";
import { backendCodeOf } from "@/shared/network/loadError";

/**
 * Lý do backend từ chối, nói bằng lời. Trước đây mọi lỗi đều thành "không gửi
 * được", kể cả khi đã hết lượt hôm nay - người học bấm lại mãi mà không biết vì
 * sao.
 */
const TUTOR_SEND_ERRORS: Record<string, string> = {
  TUTOR_DAILY_LIMIT_REACHED:
    "Bạn đã dùng hết lượt hỏi gia sư AI hôm nay. Quay lại vào ngày mai nhé.",
  TUTOR_REPLY_PENDING: "Đợi gia sư trả lời xong câu trước rồi hỏi tiếp nhé.",
  TUTOR_CONVERSATION_ARCHIVED:
    "Cuộc trò chuyện này đã được lưu trữ. Hãy bắt đầu cuộc mới.",
};

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
  const sendingRef = useRef(false);
  const generation = useRef(0);

  const [sendMessage] = useSendTutorMessageMutation();
  const [fetchConversation] = useTutorConversationLazyQuery({
    fetchPolicy: "network-only",
  });

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartedAt = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    generation.current += 1;
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
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
    async (id: string, version: number) => {
      const { data } = await fetchConversation({ variables: { id } });
      if (version !== generation.current) return false;
      if (!data?.tutorConversation) throw new Error("Conversation unavailable");
      const next = data.tutorConversation.messages;
      setMessages(next);

      return next.some(
        (message) => message.status === TutorMessageStatus.PENDING,
      );
    },
    [fetchConversation],
  );

  const poll = useCallback(
    async (id: string) => {
      stopPolling();
      const version = generation.current;
      pollStartedAt.current = Date.now();

      try {
        if (!(await pollOnce(id, version))) {
          return;
        }
      } catch {
        if (version !== generation.current) return;
        setError("Không lấy được câu trả lời. Kiểm tra kết nối rồi thử lại.");
        return;
      }

      const schedule = () => {
        pollTimer.current = setTimeout(() => {
          void (async () => {
            try {
              if (!(await pollOnce(id, version))) {
                return;
              }
              if (Date.now() - (pollStartedAt.current ?? 0) > POLL_TIMEOUT_MS) {
                stopPolling();
                // Câu trả lời vẫn có thể về sau - hàng đợi chưa bỏ cuộc - nên
                // nói rõ là "mở lại sau", đừng nói là hỏng.
                setError(
                  "Gia sư trả lời lâu hơn thường lệ. Bạn mở lại cuộc trò chuyện này sau nhé.",
                );
                return;
              }
              if (version === generation.current) schedule();
            } catch {
              if (version !== generation.current) return;
              stopPolling();
              setError(
                "Không lấy được câu trả lời. Kiểm tra kết nối rồi thử lại.",
              );
            }
          })();
        }, POLL_INTERVAL_MS);
      };
      if (version === generation.current) schedule();
    },
    [pollOnce, stopPolling],
  );

  const open = useCallback(
    async (id: string) => {
      setError(null);
      setConversationId(id);
      if (id !== conversationId) setMessages([]);
      stopPolling();
      await poll(id);
    },
    [conversationId, poll, stopPolling],
  );

  const send = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (
        !trimmed ||
        sendingRef.current ||
        messages.some(
          (message) => message.status === TutorMessageStatus.PENDING,
        )
      ) {
        return false;
      }
      sendingRef.current = true;
      const version = generation.current;
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
        if (version !== generation.current) return true;

        setConversationId(result.conversation.id);
        // Mutation chỉ trả về hai lượt vừa tạo, không phải cả cuộc hội thoại,
        // nên nối vào thay vì thay thế - nếu không, lịch sử biến mất ngay khi
        // gửi câu thứ hai.
        setMessages((previous) => [...previous, ...result.messages]);

        stopPolling();
        await poll(result.conversation.id);
        return true;
      } catch (sendError) {
        if (version !== generation.current) return false;
        setError(
          TUTOR_SEND_ERRORS[backendCodeOf(sendError) ?? ""] ??
            "Không gửi được câu hỏi. Thử lại giúp mình nhé.",
        );
        return false;
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [conversationId, poll, sendMessage, messages, stopPolling],
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
