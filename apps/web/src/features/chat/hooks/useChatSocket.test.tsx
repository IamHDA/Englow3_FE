import { CombinedGraphQLErrors } from "@apollo/client";
import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BACKOFF_MAX_MS, MAX_TICKET_AUTH_FAILURES } from "../constants/chat";
import { CHAT_SOCKET_STATUS } from "../realtime/chatSocket";
import { FRAME_TYPE } from "../realtime/frames";

import { ChatRealtimeProvider } from "../components/views/ChatRealtimeProvider";

import { useChatRealtime } from "./useChatRealtime";
import { useChatSocket } from "./useChatSocket";

const requestTicket = vi.hoisted(() => vi.fn());
const auth = vi.hoisted(() => ({
  session: null as { userId: string; role: string | null } | null,
}));

vi.mock("@/lib/graphql/generated/hooks", () => ({
  useChatSocketTicketMutation: () => [requestTicket],
}));
vi.mock("@/features/auth", () => ({
  isBackOfficeRole: (role: string | null) =>
    role === "ADMIN" || role === "STAFF",
  useAuth: () => ({ session: auth.session }),
}));

class FakeWebSocket {
  static readonly OPEN = 1;
  static instances: FakeWebSocket[] = [];
  readyState = 0;
  sent: string[] = [];
  closedWith: number | null = null;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close(code?: number) {
    this.closedWith = code ?? null;
    this.readyState = 3;
    this.onclose?.();
  }
  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }
}

const latest = () => FakeWebSocket.instances.at(-1)!;
const settle = () => act(() => vi.advanceTimersByTimeAsync(0));

function refusal(code: string) {
  return new CombinedGraphQLErrors({
    errors: [{ message: "refused", extensions: { code } }],
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("NEXT_PUBLIC_CHAT_WS_URL", "ws://backend.test/");
  vi.stubGlobal("WebSocket", FakeWebSocket);
  FakeWebSocket.instances = [];
  let n = 0;
  requestTicket
    .mockReset()
    .mockImplementation(() =>
      Promise.resolve({ data: { chatSocketTicket: { ticket: `t${++n}` } } }),
    );
  auth.session = { userId: "u1", role: null };
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("useChatSocket", () => {
  it("asks for no ticket and opens no socket while it is not enabled", async () => {
    const { result } = renderHook(() => useChatSocket({ enabled: false }));
    await settle();

    expect(requestTicket).not.toHaveBeenCalled();
    expect(FakeWebSocket.instances).toHaveLength(0);
    expect(result.current.status).toBe(CHAT_SOCKET_STATUS.idle);
  });

  it("asks for a ticket that is never cached, opens the socket with it, and counts the connection", async () => {
    const { result } = renderHook(() => useChatSocket({ enabled: true }));
    await settle();

    expect(requestTicket).toHaveBeenCalledExactlyOnceWith({
      fetchPolicy: "no-cache",
    });
    expect(latest().url).toBe("ws://backend.test/ws/chat?ticket=t1");
    expect(result.current.connectionCount).toBe(0);

    act(() => latest().open());

    expect(result.current.status).toBe(CHAT_SOCKET_STATUS.open);
    expect(result.current.connectionCount).toBe(1);
  });

  it("asks for a new ticket on every reconnect, and counts every connection", async () => {
    const { result } = renderHook(() => useChatSocket({ enabled: true }));
    await settle();
    act(() => latest().open());

    act(() => latest().close());
    expect(result.current.status).toBe(CHAT_SOCKET_STATUS.reconnecting);
    await act(() => vi.advanceTimersByTimeAsync(BACKOFF_MAX_MS));
    act(() => latest().open());

    expect(requestTicket).toHaveBeenCalledTimes(2);
    expect(latest().url).toBe("ws://backend.test/ws/chat?ticket=t2");
    expect(result.current.connectionCount).toBe(2);
  });

  it("closes the socket, with 1000, when the component goes", async () => {
    const { unmount } = renderHook(() => useChatSocket({ enabled: true }));
    await settle();
    act(() => latest().open());
    const socket = latest();

    unmount();
    await act(() => vi.advanceTimersByTimeAsync(10 * BACKOFF_MAX_MS));

    expect(socket.closedWith).toBe(1000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it("closes the socket when it is switched off", async () => {
    const { rerender } = renderHook(
      ({ enabled }) => useChatSocket({ enabled }),
      { initialProps: { enabled: true } },
    );
    await settle();
    act(() => latest().open());

    rerender({ enabled: false });

    expect(latest().closedWith).toBe(1000);
  });

  it("hands every frame to whoever subscribed, until they stop", async () => {
    const { result } = renderHook(() => useChatSocket({ enabled: true }));
    await settle();
    act(() => latest().open());
    const heard = vi.fn();
    let stop = () => {};
    act(() => {
      stop = result.current.subscribe(heard);
    });
    const frame = {
      type: "typing",
      conversationId: "c1",
      userId: "u2",
      active: true,
    };

    act(() => latest().onmessage?.({ data: JSON.stringify(frame) }));
    expect(heard).toHaveBeenCalledExactlyOnceWith({
      ...frame,
      type: FRAME_TYPE.typing,
    });

    stop();
    act(() => latest().onmessage?.({ data: JSON.stringify(frame) }));
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it("sends a typing signal only once the socket is open", async () => {
    const { result } = renderHook(() => useChatSocket({ enabled: true }));
    expect(result.current.sendTyping("c1", true)).toBe(false);
    await settle();
    expect(result.current.sendTyping("c1", true)).toBe(false);

    act(() => latest().open());

    expect(result.current.sendTyping("c1", true)).toBe(true);
    expect(JSON.parse(latest().sent[0])).toEqual({
      conversationId: "c1",
      active: true,
    });
  });

  it("says it failed, and asks for nothing, when no socket address is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_CHAT_WS_URL", "");
    const { result } = renderHook(() => useChatSocket({ enabled: true }));
    await settle();

    expect(result.current.status).toBe(CHAT_SOCKET_STATUS.failed);
    expect(requestTicket).not.toHaveBeenCalled();
  });

  it(`gives up after ${MAX_TICKET_AUTH_FAILURES} tickets refused for want of a session`, async () => {
    requestTicket.mockRejectedValue(refusal("UNAUTHENTICATED"));
    const { result } = renderHook(() => useChatSocket({ enabled: true }));

    await settle();
    await act(() => vi.advanceTimersByTimeAsync(10 * BACKOFF_MAX_MS));

    expect(requestTicket).toHaveBeenCalledTimes(MAX_TICKET_AUTH_FAILURES);
    expect(result.current.status).toBe(CHAT_SOCKET_STATUS.failed);
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it("gives up at once for an account that is not a learner", async () => {
    requestTicket.mockRejectedValue(refusal("FORBIDDEN"));
    const { result } = renderHook(() => useChatSocket({ enabled: true }));

    await settle();
    await act(() => vi.advanceTimersByTimeAsync(10 * BACKOFF_MAX_MS));

    expect(requestTicket).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe(CHAT_SOCKET_STATUS.failed);
  });
});

function Probe() {
  const { status } = useChatRealtime();
  return <p>{status}</p>;
}

function renderProvider() {
  return render(
    <ChatRealtimeProvider>
      <Probe />
    </ChatRealtimeProvider>,
  );
}

describe("ChatRealtimeProvider", () => {
  it("opens the socket for a learner", async () => {
    renderProvider();
    await settle();

    expect(requestTicket).toHaveBeenCalledTimes(1);
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(screen.getByText(CHAT_SOCKET_STATUS.connecting)).toBeInTheDocument();
  });

  it.each(["STAFF", "ADMIN"])(
    "asks for no ticket and opens no socket for %s",
    async (role) => {
      auth.session = { userId: "s1", role };
      renderProvider();
      await settle();

      expect(requestTicket).not.toHaveBeenCalled();
      expect(FakeWebSocket.instances).toHaveLength(0);
      expect(screen.getByText(CHAT_SOCKET_STATUS.idle)).toBeInTheDocument();
    },
  );

  it("asks for no ticket and opens no socket for nobody signed in", async () => {
    auth.session = null;
    renderProvider();
    await settle();

    expect(requestTicket).not.toHaveBeenCalled();
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it("closes the socket when the chat area is left", async () => {
    const { unmount } = renderProvider();
    await settle();
    act(() => latest().open());
    const socket = latest();

    unmount();

    expect(socket.closedWith).toBe(1000);
  });
});
