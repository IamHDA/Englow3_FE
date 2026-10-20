import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TutorMessageRole,
  TutorMessageStatus,
} from "@/lib/graphql/generated/schemaTypes";
import type { TutorMessage } from "../types";
import { useTutorChat } from "./useTutorChat";
import { CombinedGraphQLErrors } from "@apollo/client";

const api = vi.hoisted(() => ({
  send: vi.fn(),
  summarize: vi.fn(),
  branch: vi.fn(),
  messages: vi.fn(),
  reply: vi.fn(),
  receipt: vi.fn(),
  retry: vi.fn(),
  regenerate: vi.fn(),
  cancel: vi.fn(),
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useSummarizeTutorConversationMutation: () => [api.summarize],
  useSendTutorMessageMutation: () => [api.send],
  useBranchTutorConversationMutation: () => [api.branch],
  useTutorMessagesLazyQuery: () => [api.messages],
  useTutorReplyLazyQuery: () => [api.reply],
  useTutorReceiptLazyQuery: () => [api.receipt],
  useRetryTutorReplyMutation: () => [api.retry],
  useRegenerateTutorReplyMutation: () => [api.regenerate],
  useCancelTutorReplyMutation: () => [api.cancel],
}));
const question: TutorMessage = {
  id: "q",
  orderNo: 1,
  role: TutorMessageRole.USER,
  status: TutorMessageStatus.READY,
  content: "Explain articles",
  errorCode: null,
  model: null,
  reported: false,
  createdAt: "2026-01-01T00:00:00Z",
  answeredAt: null,
  revision: 0,
  restartCount: 0,
  correction: null,
  reportStatus: null,
  sources: [],
  summary: false,
};
const pending: TutorMessage = {
  ...question,
  id: "a",
  orderNo: 2,
  role: TutorMessageRole.ASSISTANT,
  status: TutorMessageStatus.PENDING,
  content: null,
};
const ready: TutorMessage = {
  ...pending,
  status: TutorMessageStatus.READY,
  content: "Use an before a vowel sound.",
};
const summary = {
  id: "c1",
  title: "Articles",
  messageCount: 2,
  topic: "GENERAL",
  createdAt: "2026-01-01T00:00:00Z",
  lastMessageAt: "2026-01-01T00:00:00Z",
  archivedAt: null,
  useLearningContext: true,
};
const thread = { conversation: summary, messages: [question, pending] };
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  api.send.mockResolvedValue({ data: { sendTutorMessage: thread } });
  api.reply.mockResolvedValue({ data: { tutorReply: ready } });
  api.messages.mockResolvedValue({
    data: {
      tutorMessages: { ...thread, page: 0, totalPages: 1, totalElements: 2 },
    },
  });
});

describe("Tutor delivery and recovery", () => {
  it("sends a client UUID and polls only the pending reply", async () => {
    const { result } = renderHook(() => useTutorChat(undefined, "learner"));
    await act(async () => {
      expect(await result.current.send("Explain articles")).toBe(true);
    });
    expect(api.send.mock.calls[0][0].variables.clientMessageId).toMatch(
      /^[0-9a-f-]{36}$/,
    );
    expect(api.reply).toHaveBeenCalledWith({
      variables: { conversationId: "c1", messageId: "a" },
    });
    await waitFor(() => expect(result.current.waiting).toBe(false));
    expect(result.current.messages.map((m) => m.id)).toEqual(["q", "a"]);
  });
  it("keeps an unconfirmed request and does not create another send", async () => {
    api.send.mockRejectedValueOnce(new Error("network lost"));
    const { result } = renderHook(() => useTutorChat(undefined, "learner"));
    await act(async () => {
      expect(await result.current.send("Explain articles")).toBe(false);
    });
    expect(result.current.unconfirmed).toBe(true);
    await act(async () => {
      expect(await result.current.send("Explain articles")).toBe(false);
    });
    expect(api.send).toHaveBeenCalledTimes(1);
    const key = api.send.mock.calls[0][0].variables.clientMessageId;
    api.receipt.mockResolvedValue({
      data: { tutorReceipt: { ...thread, messages: [question, ready] } },
    });
    await act(async () => {
      await result.current.recover();
    });
    expect(api.receipt).toHaveBeenCalledWith({
      variables: { clientMessageId: key },
    });
    expect(result.current.unconfirmed).toBe(false);
    expect(result.current.messages[1].content).toContain("vowel");
    expect(api.send).toHaveBeenCalledTimes(1);
  });
  it("recovers the same delivery ID after the screen is remounted", async () => {
    api.send.mockRejectedValueOnce(new Error("lost response"));
    const first = renderHook(() => useTutorChat(undefined, "learner"));
    await act(async () => {
      await first.result.current.send("Explain articles");
    });
    const key = api.send.mock.calls[0][0].variables.clientMessageId;
    first.unmount();
    const second = renderHook(() => useTutorChat(undefined, "learner"));
    expect(second.result.current.unconfirmed).toBe(true);
    api.receipt.mockResolvedValue({
      data: { tutorReceipt: { ...thread, messages: [question, ready] } },
    });
    await act(async () => {
      await second.result.current.recover();
    });
    expect(api.receipt).toHaveBeenCalledWith({
      variables: { clientMessageId: key },
    });
  });
  it("does not expose another account's outbox", async () => {
    api.send.mockRejectedValueOnce(new Error("lost response"));
    const first = renderHook(() => useTutorChat(undefined, "learner-a"));
    await act(async () => {
      await first.result.current.send("Explain articles");
    });
    first.unmount();
    const second = renderHook(() => useTutorChat(undefined, "learner-b"));
    expect(second.result.current.unconfirmed).toBe(false);
    expect(second.result.current.messages).toEqual([]);
  });
  it("ignores an old conversation read arriving after another one", async () => {
    let finish: (value: unknown) => void = () => undefined;
    api.messages.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    api.messages.mockResolvedValueOnce({
      data: {
        tutorMessages: {
          conversation: { ...summary, id: "new" },
          messages: [ready],
          page: 0,
          totalPages: 1,
          totalElements: 1,
        },
      },
    });
    const { result } = renderHook(() => useTutorChat());
    let previous: Promise<void>;
    act(() => {
      previous = result.current.open("old");
    });
    await act(async () => {
      await result.current.open("new");
    });
    await act(async () => {
      finish({
        data: {
          tutorMessages: {
            ...thread,
            page: 0,
            totalPages: 1,
            totalElements: 2,
          },
        },
      });
      await previous!;
    });
    expect(result.current.conversationId).toBe("new");
    expect(result.current.messages).toEqual([ready]);
  });
  it("blocks another question while a reply is pending", async () => {
    api.reply.mockImplementation(() => new Promise(() => undefined));
    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.send("Explain articles");
    });
    expect(result.current.waiting).toBe(true);
    await act(async () => {
      expect(await result.current.send("Another question")).toBe(false);
    });
    expect(api.send).toHaveBeenCalledTimes(1);
  });
  it("cancels the reply and stops waiting", async () => {
    api.reply.mockImplementation(() => new Promise(() => undefined));
    api.cancel.mockResolvedValue({
      data: {
        cancelTutorReply: { ...pending, status: TutorMessageStatus.CANCELLED },
      },
    });
    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.send("Explain articles");
    });
    await act(async () => {
      await result.current.cancel("a");
    });
    expect(result.current.waiting).toBe(false);
    expect(result.current.messages[1].status).toBe(
      TutorMessageStatus.CANCELLED,
    );
  });
  it("retries a failed answer without duplicating the question", async () => {
    api.messages.mockResolvedValue({
      data: {
        tutorMessages: {
          ...thread,
          messages: [
            question,
            { ...pending, status: TutorMessageStatus.FAILED },
          ],
          page: 0,
          totalPages: 1,
          totalElements: 2,
        },
      },
    });
    api.reply.mockResolvedValue({
      data: { tutorReply: { ...ready, revision: 1 } },
    });
    api.retry.mockResolvedValue({
      data: {
        retryTutorReply: {
          ...thread,
          messages: [question, { ...pending, revision: 1 }],
        },
      },
    });
    const { result } = renderHook(() => useTutorChat());
    await act(async () => {
      await result.current.open("c1");
    });
    await act(async () => {
      await result.current.restart("a");
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].revision).toBe(1);
    expect(api.send).not.toHaveBeenCalled();
  });
  it("does not erase a new account's outbox when an old account's send finishes late", async () => {
    let finish: (value: unknown) => void = () => undefined;
    api.send.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { result, rerender } = renderHook(
      ({ account }) => useTutorChat(undefined, account),
      { initialProps: { account: "account-a" } },
    );
    let pendingSend: Promise<boolean>;
    act(() => {
      pendingSend = result.current.send("Explain articles");
    });
    const saved = {
      key: "another-delivery",
      kind: "send",
      message: "Different question",
      mode: "GENERAL",
      personalized: false,
      created: Date.now(),
    };
    sessionStorage.setItem(
      "englow:tutor:outbox:account-b",
      JSON.stringify(saved),
    );
    rerender({ account: "account-b" });
    expect(result.current.unconfirmed).toBe(true);
    await act(async () => {
      finish({ data: { sendTutorMessage: thread } });
      await pendingSend;
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.unconfirmed).toBe(true);
    expect(
      JSON.parse(sessionStorage.getItem("englow:tutor:outbox:account-b")!).key,
    ).toBe(saved.key);
  });
  it("uses a durable client ID when editing a question into a new conversation", async () => {
    api.branch.mockResolvedValue({
      data: {
        branchTutorConversation: {
          ...thread,
          conversation: { ...summary, id: "branch" },
        },
      },
    });
    const { result } = renderHook(() => useTutorChat(undefined, "learner"));
    await act(async () => {
      await result.current.open("c1");
    });
    await waitFor(() => expect(result.current.waiting).toBe(false));
    await act(async () => {
      expect(
        await result.current.branch("q", "Explain definite articles", false),
      ).toBe(true);
    });
    expect(api.branch.mock.calls[0][0].variables).toMatchObject({
      conversationId: "c1",
      messageId: "q",
      message: "Explain definite articles",
      personalized: false,
    });
    expect(api.branch.mock.calls[0][0].variables.clientMessageId).toMatch(
      /^[0-9a-f-]{36}$/,
    );
    expect(result.current.conversationId).toBe("branch");
  });
});

it("recovers an uncertain summary through its receipt without another AI request", async () => {
  const { result } = renderHook(() => useTutorChat(undefined, "learner"));
  await act(async () => {
    await result.current.open("c1");
  });
  await waitFor(() => expect(result.current.waiting).toBe(false));
  api.summarize.mockRejectedValueOnce(new Error("response lost"));
  await act(async () => {
    expect(await result.current.summarize()).toBe(false);
  });
  const key = api.summarize.mock.calls[0][0].variables.clientMessageId;
  expect(result.current.unconfirmed).toBe(true);
  await act(async () => {
    expect(await result.current.summarize()).toBe(false);
  });
  const completed = {
    conversation: { ...summary, messageCount: 4 },
    messages: [
      question,
      ready,
      { ...question, id: "memory-q", orderNo: 3, summary: true },
      {
        ...ready,
        id: "memory-a",
        orderNo: 4,
        summary: true,
        content: "Synthetic AI notes",
      },
    ],
  };
  api.receipt.mockResolvedValue({ data: { tutorReceipt: completed } });
  api.messages.mockResolvedValue({
    data: {
      tutorMessages: { ...completed, page: 0, totalPages: 1, totalElements: 4 },
    },
  });
  await act(async () => {
    await result.current.recover();
  });
  expect(api.receipt).toHaveBeenCalledWith({
    variables: { clientMessageId: key },
  });
  expect(api.summarize).toHaveBeenCalledTimes(1);
  expect(api.send).not.toHaveBeenCalled();
  expect(result.current.unconfirmed).toBe(false);
  expect(result.current.acceptedDelivery).toBeNull();
  expect(
    result.current.messages.some((message) => message.id === "memory-a"),
  ).toBe(true);
});

it("treats an unassessed study context as a definite refusal and preserves the caller's draft", async () => {
  api.send.mockRejectedValueOnce(
    new CombinedGraphQLErrors({
      errors: [
        {
          message: "Not assessed",
          extensions: {
            code: "CONFLICT",
            backendCode: "TUTOR_CONTEXT_NOT_READY",
          },
        },
      ],
    }),
  );
  const { result } = renderHook(() => useTutorChat(undefined, "learner"));
  const id = "c60bcb3a-a40a-48db-9681-6a176d65cf0f";
  await act(async () => {
    expect(
      await result.current.send("Explain my feedback", "GENERAL", false, {
        assessmentAttemptId: id,
      }),
    ).toBe(false);
  });
  expect(api.send.mock.calls[0][0].variables.assessmentAttemptId).toBe(id);
  expect(result.current.unconfirmed).toBe(false);
  expect(result.current.error).toContain("chưa có kết quả chấm");
});
