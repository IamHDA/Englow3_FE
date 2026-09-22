import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  TutorMessageRole,
  TutorMessageStatus,
} from "@/lib/graphql/generated/schemaTypes";

import { useTutorChat } from "./useTutorChat";
import type { TutorMessage } from "../types";

const sendMessage = vi.fn();
const fetchConversation = vi.fn();

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useSendTutorMessageMutation: () => [sendMessage],
  useTutorConversationLazyQuery: () => [fetchConversation],
}));

function message(
  id: string,
  role: TutorMessageRole,
  status: TutorMessageStatus,
  content: string | null,
): TutorMessage {
  return {
    __typename: "TutorMessage",
    id,
    orderNo: 1,
    role,
    status,
    content,
    errorCode: null,
    model: null,
    reported: false,
    createdAt: "2026-01-01T00:00:00Z",
    answeredAt: null,
  } as TutorMessage;
}

const QUESTION = message(
  "m1",
  TutorMessageRole.USER,
  TutorMessageStatus.READY,
  "What is a gerund?",
);
const PENDING = message(
  "m2",
  TutorMessageRole.ASSISTANT,
  TutorMessageStatus.PENDING,
  null,
);
const ANSWERED = message(
  "m2",
  TutorMessageRole.ASSISTANT,
  TutorMessageStatus.READY,
  "A verb used as a noun.",
);

function sent(conversationId = "c1", messages = [QUESTION, PENDING]) {
  return {
    data: {
      sendTutorMessage: {
        conversation: { id: conversationId, messageCount: messages.length },
        messages,
      },
    },
  };
}

function polled(messages: TutorMessage[]) {
  return { data: { tutorConversation: { messages } } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useTutorChat", () => {
  it("shows the question and a pending turn as soon as it is sent", async () => {
    sendMessage.mockResolvedValue(sent());
    fetchConversation.mockResolvedValue(polled([QUESTION, PENDING]));

    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.send("What is a gerund?");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.waiting).toBe(true);
  });

  it("stops waiting once the answer lands", async () => {
    sendMessage.mockResolvedValue(sent());
    fetchConversation.mockResolvedValue(polled([QUESTION, ANSWERED]));

    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.send("What is a gerund?");
    });

    await waitFor(() => expect(result.current.waiting).toBe(false));
    expect(result.current.messages.at(-1)?.content).toBe(
      "A verb used as a noun.",
    );
  });

  // Gửi câu hỏi thứ hai chỉ trả về hai lượt mới. Thay vì nối, mà thay thế, thì
  // lịch sử biến mất ngay giữa cuộc trò chuyện.
  it("keeps the earlier turns when a second question is sent", async () => {
    fetchConversation.mockResolvedValue(polled([QUESTION, ANSWERED]));
    sendMessage.mockResolvedValue(sent());

    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.send("What is a gerund?");
    });
    await waitFor(() => expect(result.current.waiting).toBe(false));

    const second = message(
      "m3",
      TutorMessageRole.USER,
      TutorMessageStatus.READY,
      "Give me an example.",
    );
    sendMessage.mockResolvedValue(sent("c1", [second, PENDING]));
    fetchConversation.mockResolvedValue(
      polled([QUESTION, ANSWERED, second, ANSWERED]),
    );

    await act(async () => {
      await result.current.send("Give me an example.");
    });

    await waitFor(() => expect(result.current.messages.length).toBe(4));
  });

  it("does not send an empty question", async () => {
    const { result } = renderHook(() => useTutorChat());

    await act(async () => {
      await result.current.send("   ");
    });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("explains itself when the question cannot be sent", async () => {
    sendMessage.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.send("What is a gerund?");
    });

    expect(result.current.error).toContain("Không gửi được");
    expect(result.current.sending).toBe(false);
  });

  // Một lượt FAILED đã xong - không còn gì để chờ, nên vòng hỏi phải dừng thay
  // vì quay mãi bên cạnh một câu đã báo là hỏng.
  it("stops waiting on a turn that failed", async () => {
    sendMessage.mockResolvedValue(sent());
    fetchConversation.mockResolvedValue(
      polled([
        QUESTION,
        message("m2", TutorMessageRole.ASSISTANT, TutorMessageStatus.FAILED, null),
      ]),
    );

    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.send("What is a gerund?");
    });

    await waitFor(() => expect(result.current.waiting).toBe(false));
  });

  it("clears the thread when a new conversation is started", async () => {
    sendMessage.mockResolvedValue(sent());
    fetchConversation.mockResolvedValue(polled([QUESTION, ANSWERED]));

    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.send("What is a gerund?");
    });
    await waitFor(() => expect(result.current.messages.length).toBe(2));

    act(() => result.current.reset());

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.conversationId).toBeUndefined();
  });
});
