"use client";

import type { TutorStudyContext } from "./tutorStudyContext";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";
import { TutorMessageStatus } from "@/lib/graphql/generated/schemaTypes";
import {
  useSummarizeTutorConversationMutation,
  useSendTutorMessageMutation,
  useBranchTutorConversationMutation,
  useTutorMessagesLazyQuery,
  useTutorReplyLazyQuery,
  useTutorReceiptLazyQuery,
  useRetryTutorReplyMutation,
  useRegenerateTutorReplyMutation,
  useCancelTutorReplyMutation,
} from "@/lib/graphql/generated/hooks";
import { readTutorStream } from "./tutorStream";
import type { TutorConversationSummary, TutorMessage } from "../types";
import {
  FAST_POLL_WINDOW_MS,
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_MS,
} from "../constants/tutorChat";

export type TutorMode = "GENERAL" | "CORRECTION" | "CONVERSATION" | "PRACTICE";
type Delivery = {
  key: string;
  conversationId?: string;
  message: string;
  mode: TutorMode;
  personalized: boolean;
  kind: "send" | "retry" | "regenerate" | "branch" | "summary";
  messageId?: string;
  created: number;
  quizAttemptId?: string;
  quizQuestionId?: string;
  assessmentAttemptId?: string;
  examAttemptId?: string;
  examQuestionId?: string;
};
type Accepted = {
  conversation: TutorConversationSummary;
  messages: TutorMessage[];
};
const MAX_AGE = 24 * 60 * 60 * 1000;

function merge(previous: TutorMessage[], next: TutorMessage[]) {
  const map = new Map(previous.map((message) => [message.id, message]));
  for (const message of next) {
    const existing = map.get(message.id);
    if (!existing || (message.revision ?? 0) >= (existing.revision ?? 0))
      map.set(message.id, message);
  }
  return [...map.values()].sort((a, b) => a.orderNo - b.orderNo);
}

/** A failed delivery keeps its UUID until the server confirms whether it accepted it. */
export function useTutorChat(
  initialConversationId?: string,
  accountScope?: string,
  streaming = false,
) {
  const { isVi } = useLanguage();
  const language = useRef(isVi);
  useEffect(() => {
    language.current = isVi;
  }, [isVi]);
  const tr = useCallback(
    (vi: string, en: string) => (language.current ? vi : en),
    [],
  );
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [conversation, setConversation] =
    useState<TutorConversationSummary | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updated, setUpdated] = useState(0);
  const [acceptedDelivery, setAcceptedDelivery] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const streamAbort = useRef<AbortController | null>(null);
  const streamEnabled = useRef(streaming);
  useEffect(() => {
    streamEnabled.current = streaming;
  }, [streaming]);
  useEffect(() => {
    const pause = () => {
      if (document.visibilityState === "hidden") streamAbort.current?.abort();
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  const generation = useRef(0);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delivery = useRef<Delivery | null>(null);
  const storageKey = accountScope
    ? `englow:tutor:outbox:${accountScope}`
    : null;
  const [summarizeConversation] = useSummarizeTutorConversationMutation();
  const [sendMessage] = useSendTutorMessageMutation();
  const [branchConversation] = useBranchTutorConversationMutation();
  const [fetchMessages] = useTutorMessagesLazyQuery({
    fetchPolicy: "network-only",
  });
  const [fetchReply] = useTutorReplyLazyQuery({ fetchPolicy: "network-only" });
  const [fetchReceipt] = useTutorReceiptLazyQuery({
    fetchPolicy: "network-only",
  });
  const [retryReply] = useRetryTutorReplyMutation();
  const [regenerateReply] = useRegenerateTutorReplyMutation();
  const [cancelReply] = useCancelTutorReplyMutation();

  const stopPolling = useCallback(() => {
    generation.current++;
    streamAbort.current?.abort();
    streamAbort.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => stopPolling, [stopPolling]);

  const remember = useCallback(
    (value: Delivery | null) => {
      delivery.current = value;
      setUnconfirmed(value !== null);
      if (!storageKey) return;
      try {
        if (value) sessionStorage.setItem(storageKey, JSON.stringify(value));
        else sessionStorage.removeItem(storageKey);
      } catch {
        /* In-memory recovery still works when storage is unavailable. */
      }
    },
    [storageKey],
  );

  useEffect(() => {
    stopPolling();
    delivery.current = null;
    // Clear private state immediately when the authenticated account changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConversationId(initialConversationId);
    setConversation(null);
    setMessages([]);
    setAcceptedDelivery(null);
    setError(null);
    setUnconfirmed(false);
    setPage(0);
    setTotalPages(0);
    if (!storageKey) return;
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(storageKey) ?? "null",
      ) as Delivery | null;
      if (
        saved &&
        typeof saved.key === "string" &&
        typeof saved.created === "number" &&
        Date.now() - saved.created < MAX_AGE
      ) {
        delivery.current = saved;
        setUnconfirmed(true);
        setError(
          tr(
            "Có câu hỏi chưa xác nhận giao nhận. Kiểm tra trước khi gửi tiếp.",
            "A previous request needs delivery confirmation. Check it before sending again.",
          ),
        );
      } else sessionStorage.removeItem(storageKey);
    } catch {
      sessionStorage.removeItem(storageKey);
    }
  }, [initialConversationId, storageKey, stopPolling, tr]);

  const explain = useCallback(
    (failure: unknown) => {
      switch (backendCodeOf(failure)) {
        case "TUTOR_MEMORY_DISABLED":
        case "TUTOR_MEMORY_ACTION":
          return tr(
            "Dùng phần Ghi nhớ cuộc trò chuyện để tạo bản tổng kết mới khi tính năng khả dụng.",
            "Use the conversation memory controls to create a new summary when available.",
          );
        case "TUTOR_MEMORY_CURRENT":
          return tr(
            "Chưa có thêm tin nhắn hoàn tất để tổng kết.",
            "There are no new completed messages to summarize.",
          );
        case "QUIZ_ATTEMPT_NOT_SCORED":
          return tr(
            "Hãy nộp và chấm bài Quiz trước khi nhờ giải thích đáp án.",
            "Submit and finish grading the quiz before requesting an answer explanation.",
          );
        case "QUIZ_ATTEMPT_NOT_FOUND":
        case "QUIZ_QUESTION_NOT_FOUND":
          return tr(
            "Không tìm thấy câu Quiz đã nộp thuộc tài khoản này.",
            "No submitted quiz question is available for this account.",
          );
        case "TUTOR_CONTEXT_NOT_READY":
          return tr(
            "Bài này chưa có kết quả chấm. Hãy hoàn tất và chấm bài trước khi nhờ Tutor giải thích.",
            "This work has not been assessed. Finish and grade it before asking Tutor for feedback.",
          );
        case "ASSESSMENT_NOT_FOUND":
        case "ATTEMPT_NOT_FOUND":
        case "TUTOR_CONTEXT_QUESTION":
        case "TUTOR_CONTEXT_UNAVAILABLE":
          return tr(
            "Không đọc được bài đã chấm thuộc tài khoản này. Hãy mở lại từ màn hình kết quả.",
            "This account's completed work is unavailable. Open it again from its result page.",
          );
        case "TUTOR_CONTEXT_CHANGE":
          return tr(
            "Hãy mở cuộc trò chuyện mới khi đổi bài hoặc câu hỏi ngữ cảnh.",
            "Start a new conversation for a different submission or question.",
          );
        case "TUTOR_REQUEST_REMOVED":
          return tr(
            "Cuộc trò chuyện này đã được xóa. Hãy bắt đầu câu hỏi mới.",
            "This conversation was deleted. Start a new question.",
          );
        case "AI_QUEUE_BUSY":
          return tr(
            "Hàng đợi AI đang đầy. Nội dung được giữ, hãy thử lại sau ít phút.",
            "The AI queue is full. Your draft is kept; please retry in a few minutes.",
          );
        case "TUTOR_DAILY_LIMIT_REACHED":
          return tr(
            "Bạn đã dùng hết lượt AI hôm nay. Lượt dùng chung với Viết và Nói.",
            "Today's shared AI allowance has been reached.",
          );
        case "TUTOR_RATE_LIMIT":
          return tr(
            "Bạn hỏi hơi nhanh. Vui lòng đợi một phút.",
            "Please wait a minute before asking again.",
          );
        case "TUTOR_REPLY_PENDING":
          return tr(
            "Câu trước vẫn đang xử lý. Mở lại để nhận kết quả hoặc dừng câu đó.",
            "The previous reply is still being processed. Reopen it or stop it first.",
          );
        case "TUTOR_CONVERSATION_ARCHIVED":
          return tr(
            "Khôi phục cuộc trò chuyện trước khi hỏi tiếp.",
            "Restore this conversation before continuing.",
          );
        case "TUTOR_MODE_DISABLED":
        case "TUTOR_DISABLED":
          return tr(
            "Gia sư đang tạm ngừng. Bản nháp của bạn vẫn được giữ.",
            "The tutor is temporarily unavailable. Your draft is kept.",
          );
        case "TUTOR_RETRY_LIMIT":
          return tr(
            "Đã đạt giới hạn thử lại. Hãy bắt đầu một câu hỏi mới.",
            "The retry limit has been reached. Start a new question.",
          );
        case "TUTOR_REPLY_HAS_FOLLOWUPS":
          return tr(
            "Câu trả lời này đã có lượt tiếp theo. Hãy mở cuộc mới để giữ đúng ngữ cảnh.",
            "This reply already has follow-ups. Start a new conversation to preserve context.",
          );
        default:
          return tr(
            "Không thể hoàn tất thao tác. Nội dung của bạn vẫn được giữ.",
            "Could not finish this action. Your content has been kept.",
          );
      }
    },
    [tr],
  );

  const poll = useCallback(
    (id: string, messageId: string) => {
      stopPolling();
      const version = generation.current;
      const started = Date.now();
      let delay = POLL_INTERVAL_MS;
      let cursor = "";
      let tryStream = streamEnabled.current;
      const step = async () => {
        let responsive = false;
        if (version !== generation.current) return;
        if (Date.now() - started >= POLL_TIMEOUT_MS) {
          setError(
            tr(
              "Đã lưu câu hỏi, nhưng gia sư đang xử lý lâu. Bạn có thể kiểm tra lại hoặc dừng lượt này.",
              "Your question is saved, but the reply is taking longer. Check again or stop this reply.",
            ),
          );
          return;
        }
        if (navigator.onLine && document.visibilityState !== "hidden") {
          try {
            if (tryStream) {
              const controller = new AbortController();
              streamAbort.current = controller;
              try {
                const terminal = await readTutorStream(
                  id,
                  messageId,
                  cursor,
                  AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(
                      Math.max(
                        1,
                        Math.min(
                          50000,
                          POLL_TIMEOUT_MS - (Date.now() - started),
                        ),
                      ),
                    ),
                  ]),
                  (event) => {
                    if (version !== generation.current) return;
                    if (event.id) cursor = event.id;
                    if (event.type === "gone") {
                      tryStream = false;
                      return;
                    }
                    if (event.type === "done" && event.message) {
                      setMessages((current) =>
                        merge(current, [event.message!]),
                      );
                      setUpdated((value) => value + 1);
                      setError(null);
                    }
                    if (event.type === "reset" || event.type === "delta")
                      setMessages((current) =>
                        current.map((message) =>
                          message.id === messageId
                            ? {
                                ...message,
                                content:
                                  event.type === "reset"
                                    ? ""
                                    : (message.content ?? "") +
                                      (event.delta ?? ""),
                              }
                            : message,
                        ),
                      );
                  },
                );
                if (version !== generation.current || terminal) return;
              } catch {
                if (version !== generation.current) return;
                if (!controller.signal.aborted) tryStream = false;
              } finally {
                if (streamAbort.current === controller)
                  streamAbort.current = null;
              }
              if (tryStream) {
                timer.current = setTimeout(() => void step(), delay);
                delay = Math.min(Math.round(delay * 1.5), 10000);
                return;
              }
            }
            const { data } = await fetchReply({
              variables: { conversationId: id, messageId },
            });
            if (version !== generation.current) return;
            const reply = data?.tutorReply;
            if (!reply) throw new Error("Reply unavailable");
            setMessages((current) => merge(current, [reply]));
            setError(null);
            if (reply.status !== TutorMessageStatus.PENDING) {
              setUpdated((value) => value + 1);
              return;
            }
            responsive = true;
          } catch {
            if (version !== generation.current) return;
            setError(
              tr(
                "Kết nối gián đoạn. Câu hỏi đã lưu; đang tự kiểm tra lại.",
                "Connection interrupted. Your question is saved; checking again automatically.",
              ),
            );
          }
        }
        if (version !== generation.current) return;
        // Healthy, short replies should not sit ready behind a ten-second polling gap.
        delay =
          responsive && Date.now() - started < FAST_POLL_WINDOW_MS
            ? POLL_INTERVAL_MS
            : Math.min(Math.round(delay * 1.5), 10000);
        timer.current = setTimeout(() => void step(), delay);
      };
      void step();
    },
    [fetchReply, stopPolling, tr],
  );

  const open = useCallback(
    async (id: string) => {
      stopPolling();
      const version = generation.current;
      setConversationId(id);
      setConversation(null);
      setMessages([]);
      setError(null);
      setLoading(true);
      setPage(0);
      setTotalPages(0);
      try {
        const { data } = await fetchMessages({
          variables: { id, page: 0, size: 30 },
        });
        if (version !== generation.current) return;
        if (!data?.tutorMessages) throw new Error("Conversation unavailable");
        const thread = data.tutorMessages;
        setConversation(thread.conversation);
        setMessages(thread.messages);
        setTotalPages(thread.totalPages);
        setLoading(false);
        const pending = thread.messages.find(
          (message) => message.status === TutorMessageStatus.PENDING,
        );
        if (pending) poll(id, pending.id);
      } catch (failure) {
        if (version === generation.current) setError(explain(failure));
      } finally {
        if (version === generation.current) setLoading(false);
      }
    },
    [explain, fetchMessages, poll, stopPolling],
  );

  const loadOlder = useCallback(async () => {
    if (!conversationId || loading || page + 1 >= totalPages) return;
    const id = conversationId,
      version = generation.current;
    setLoading(true);
    try {
      const { data } = await fetchMessages({
        variables: { id, page: page + 1, size: 30 },
      });
      if (version !== generation.current || !data?.tutorMessages) return;
      setMessages((current) => merge(current, data.tutorMessages.messages));
      setPage(page + 1);
      setTotalPages(data.tutorMessages.totalPages);
    } catch (failure) {
      if (version === generation.current) setError(explain(failure));
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }, [conversationId, explain, fetchMessages, loading, page, totalPages]);

  const accept = useCallback(
    (result: Accepted, version: number) => {
      if (version !== generation.current) return;
      const confirmed = delivery.current;
      remember(null);
      if (
        confirmed &&
        (confirmed.kind === "send" || confirmed.kind === "branch")
      )
        setAcceptedDelivery({ key: confirmed.key, message: confirmed.message });
      setConversationId(result.conversation.id);
      setConversation(result.conversation);
      if (result.conversation.id !== conversationId) {
        setPage(0);
        setTotalPages(Math.ceil(result.conversation.messageCount / 30));
      }
      setMessages((current) =>
        merge(
          result.conversation.id === conversationId ? current : [],
          result.messages,
        ),
      );
      setUpdated((value) => value + 1);
      setError(null);
      const pending = result.messages.find(
        (message) => message.status === TutorMessageStatus.PENDING,
      );
      if (pending) poll(result.conversation.id, pending.id);
    },
    [conversationId, poll, remember],
  );

  const deliver = useCallback(
    async (action: Delivery) => {
      if (busy.current) return false;
      busy.current = true;
      setSending(true);
      setError(null);
      const version = generation.current;
      remember(action);
      try {
        let result: Accepted | undefined;
        if (action.kind === "summary") {
          result = (
            await summarizeConversation({
              variables: {
                conversationId: action.conversationId!,
                clientMessageId: action.key,
              },
            })
          ).data?.summarizeTutorConversation;
        } else if (action.kind === "branch") {
          result = (
            await branchConversation({
              variables: {
                conversationId: action.conversationId!,
                messageId: action.messageId!,
                message: action.message,
                clientMessageId: action.key,
                personalized: action.personalized,
              },
            })
          ).data?.branchTutorConversation;
        } else if (action.kind === "send") {
          const { data } = await sendMessage({
            variables: {
              conversationId: action.conversationId,
              message: action.message,
              clientMessageId: action.key,
              mode: action.mode,
              personalized: action.personalized,
              quizAttemptId: action.quizAttemptId,
              quizQuestionId: action.quizQuestionId,
              assessmentAttemptId: action.assessmentAttemptId,
              examAttemptId: action.examAttemptId,
              examQuestionId: action.examQuestionId,
            },
          });
          result = data?.sendTutorMessage;
        } else {
          const variables = {
            conversationId: action.conversationId!,
            messageId: action.messageId!,
            clientMessageId: action.key,
          };
          if (action.kind === "retry")
            result = (await retryReply({ variables })).data?.retryTutorReply;
          else
            result = (await regenerateReply({ variables })).data
              ?.regenerateTutorReply;
        }
        if (!result) throw new Error("Request unconfirmed");
        accept(result, version);
        return true;
      } catch (failure) {
        const code = backendCodeOf(failure);
        const rejected =
          code !== null &&
          [
            "TUTOR_DAILY_LIMIT_REACHED",
            "TUTOR_MEMORY_DISABLED",
            "TUTOR_MEMORY_CURRENT",
            "TUTOR_MEMORY_ACTION",
            "TUTOR_CONTEXT_TOO_LARGE",
            "TUTOR_CONTEXT_INVALID",
            "TUTOR_CONTEXT_CHANGE",
            "TUTOR_CONTEXT_NOT_READY",
            "TUTOR_CONTEXT_UNAVAILABLE",
            "TUTOR_CONTEXT_QUESTION",
            "ASSESSMENT_NOT_FOUND",
            "ATTEMPT_NOT_FOUND",
            "QUIZ_ATTEMPT_NOT_SCORED",
            "QUIZ_ATTEMPT_NOT_FOUND",
            "QUIZ_QUESTION_NOT_FOUND",
            "TUTOR_HISTORY_LIMIT",
            "TUTOR_VERSION_NOT_FOUND",
            "TUTOR_BRANCH_QUESTION",
            "TUTOR_REQUEST_REMOVED",
            "AI_QUEUE_BUSY",
            "TUTOR_RATE_LIMIT",
            "TUTOR_REPLY_PENDING",
            "TUTOR_CONVERSATION_ARCHIVED",
            "TUTOR_DISABLED",
            "TUTOR_RETRY_LIMIT",
            "TUTOR_REPLY_HAS_FOLLOWUPS",
            "TUTOR_REPLY_NOT_RETRYABLE",
            "TUTOR_REQUEST_CONFLICT",
            "TUTOR_MODE_INVALID",
            "TUTOR_MODE_DISABLED",
            "TUTOR_CONVERSATION_NOT_FOUND",
            "TUTOR_MESSAGE_NOT_FOUND",
            "VALIDATION_FAILED",
            "BAD_USER_INPUT",
            "ACCESS_DENIED",
            "UNAUTHENTICATED",
          ].includes(code);
        if (rejected) remember(null);
        if (version === generation.current)
          setError(
            rejected
              ? explain(failure)
              : tr(
                  "Chưa xác nhận được câu hỏi đã gửi. Bấm kiểm tra giao nhận; hệ thống sẽ dùng lại đúng mã gửi, không tạo câu hỏi trùng.",
                  "Delivery is not confirmed. Check delivery to reuse the same request ID without creating a duplicate question.",
                ),
          );
        return false;
      } finally {
        busy.current = false;
        setSending(false);
      }
    },
    [
      accept,
      explain,
      regenerateReply,
      remember,
      retryReply,
      sendMessage,
      branchConversation,
      summarizeConversation,
      tr,
    ],
  );

  const send = useCallback(
    async (
      message: string,
      mode: TutorMode = "GENERAL",
      personalized = true,
      study?: TutorStudyContext,
    ) => {
      if (
        !message.trim() ||
        messages.some((m) => m.status === TutorMessageStatus.PENDING)
      )
        return false;
      if (delivery.current) {
        setUnconfirmed(true);
        return false;
      }
      return deliver({
        key: crypto.randomUUID(),
        kind: "send",
        ...study,
        conversationId,
        message: message.trim(),
        mode,
        personalized,
        created: Date.now(),
      });
    },
    [conversationId, deliver, messages],
  );

  const branch = useCallback(
    async (messageId: string, message: string, personalized = true) => {
      if (
        !conversationId ||
        !message.trim() ||
        delivery.current ||
        busy.current ||
        messages.some((m) => m.status === TutorMessageStatus.PENDING)
      )
        return false;
      return deliver({
        key: crypto.randomUUID(),
        kind: "branch",
        conversationId,
        messageId,
        message: message.trim(),
        mode: "GENERAL",
        personalized,
        created: Date.now(),
      });
    },
    [conversationId, deliver, messages],
  );
  const recover = useCallback(async () => {
    const action = delivery.current;
    if (!action || busy.current) return;
    const version = generation.current;
    setSending(true);
    busy.current = true;
    try {
      const { data } = await fetchReceipt({
        variables: { clientMessageId: action.key },
      });
      if (!data?.tutorReceipt) throw new Error("Receipt unavailable");
      if (version === generation.current) {
        accept(data.tutorReceipt, version);
        await open(data.tutorReceipt.conversation.id);
      }
    } catch (failure) {
      if (backendCodeOf(failure) === "TUTOR_REQUEST_NOT_FOUND") {
        busy.current = false;
        await deliver(action);
      } else if (version === generation.current)
        setError(
          tr(
            "Chưa kiểm tra được giao nhận. Vui lòng thử lại khi có mạng.",
            "Could not check delivery. Try again when connected.",
          ),
        );
    } finally {
      busy.current = false;
      setSending(false);
    }
  }, [accept, deliver, fetchReceipt, open, tr]);

  const restart = useCallback(
    async (messageId: string, regenerate = false) => {
      if (!conversationId || delivery.current) return false;
      return deliver({
        key: crypto.randomUUID(),
        kind: regenerate ? "regenerate" : "retry",
        conversationId,
        messageId,
        message: "",
        mode: "GENERAL",
        personalized: true,
        created: Date.now(),
      });
    },
    [conversationId, deliver],
  );

  const cancel = useCallback(
    async (messageId: string) => {
      if (!conversationId || busy.current) return;
      const version = generation.current;
      setSending(true);
      busy.current = true;
      try {
        const { data } = await cancelReply({
          variables: { conversationId, messageId },
        });
        if (version !== generation.current) return;
        if (data?.cancelTutorReply) {
          stopPolling();
          setMessages((current) => merge(current, [data.cancelTutorReply]));
          setError(null);
          setUpdated((value) => value + 1);
        }
      } catch (failure) {
        if (version === generation.current) setError(explain(failure));
      } finally {
        busy.current = false;
        setSending(false);
      }
    },
    [cancelReply, conversationId, explain, stopPolling],
  );

  const summarize = useCallback(async () => {
    if (
      !conversationId ||
      delivery.current ||
      messages.some((m) => m.status === TutorMessageStatus.PENDING)
    )
      return false;
    return deliver({
      key: crypto.randomUUID(),
      kind: "summary",
      conversationId,
      message: "Update conversation memory",
      mode: "GENERAL",
      personalized: false,
      created: Date.now(),
    });
  }, [conversationId, deliver, messages]);

  const reset = useCallback(() => {
    stopPolling();
    setConversationId(undefined);
    setConversation(null);
    setMessages([]);
    setError(null);
    setPage(0);
    setTotalPages(0);
    setLoading(false);
  }, [stopPolling]);

  const forget = useCallback(() => {
    reset();
    remember(null);
    setAcceptedDelivery(null);
  }, [reset, remember]);
  return {
    acceptedDelivery,
    summarize,
    forget,
    conversationId,
    conversation,
    messages,
    sending,
    loading,
    error,
    unconfirmed,
    updated,
    waiting: messages.some((m) => m.status === TutorMessageStatus.PENDING),
    hasOlder: page + 1 < totalPages,
    send,
    branch,
    open,
    reset,
    loadOlder,
    recover,
    restart,
    cancel,
  };
}
