import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  MAX_FAILED_CONNECTS,
  MAX_TICKET_AUTH_FAILURES,
  SOCKET_CLOSE_POLICY_VIOLATION,
} from "../constants/chat";

import {
  backoffDelay,
  CHAT_SOCKET_FAILURE,
  CHAT_SOCKET_STATUS,
  ChatTicketRefused,
  createChatSocket,
  type ChatSocketFailure,
  type ChatSocketStatus,
} from "./chatSocket";
import { FRAME_TYPE, type ChatFrame } from "./frames";

/** The parts of the browser's WebSocket the socket uses, driven by hand. */
class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  sent: string[] = [];
  closedWith: number | null = null;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  /** The caller's own close(). The browser reports it with a close event afterwards. */
  close(code?: number) {
    this.closedWith = code ?? null;
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code: code ?? NO_STATUS_CODE });
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  receive(data: unknown) {
    this.onmessage?.({ data });
  }

  /** The connection dropped, or the handshake was refused: the browser's 1006 unless the server said otherwise. */
  drop(code = ABNORMAL_CLOSE_CODE) {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code });
  }
}

const URL = "wss://backend.test/ws/chat";

const NO_STATUS_CODE = 1005;
const ABNORMAL_CLOSE_CODE = 1006;

function setup(
  getTicket: () => Promise<string> = (() => {
    let n = 0;
    return () => Promise.resolve(`t${++n}`);
  })(),
) {
  const frames: ChatFrame[] = [];
  const statuses: ChatSocketStatus[] = [];
  /** The reason that came with the latest status, if any. */
  const failures: Array<ChatSocketFailure | undefined> = [];
  const onConnected = vi.fn();
  const getTicketSpy = vi.fn(getTicket);
  const socket = createChatSocket({
    url: URL,
    getTicket: getTicketSpy,
    onFrame: (frame) => frames.push(frame),
    onConnected,
    onStatus: (status, failure) => {
      statuses.push(status);
      failures.push(failure);
    },
    random: () => 0,
  });
  return {
    socket,
    frames,
    statuses,
    failures,
    onConnected,
    getTicket: getTicketSpy,
  };
}

const latest = () => FakeWebSocket.instances.at(-1)!;

/** Lets the ticket promise settle and the socket be created. */
const settle = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  FakeWebSocket.instances = [];
  vi.stubGlobal("WebSocket", FakeWebSocket);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("connecting", () => {
  it("opens the socket with the ticket in the query, encoded", async () => {
    const { socket } = setup(() => Promise.resolve("a b/c+d"));

    socket.start();
    await settle();

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(latest().url).toBe(`${URL}?ticket=a%20b%2Fc%2Bd`);
  });

  it("reports connecting, then open, and tells the caller to catch up on every open", async () => {
    const { socket, statuses, onConnected } = setup();

    socket.start();
    await settle();
    expect(statuses).toEqual([CHAT_SOCKET_STATUS.connecting]);
    expect(onConnected).not.toHaveBeenCalled();

    latest().open();
    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.open);
    expect(onConnected).toHaveBeenCalledTimes(1);

    latest().drop();
    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_MS);
    latest().open();
    expect(onConnected).toHaveBeenCalledTimes(2);
  });

  it("starts once, however many times it is told to", async () => {
    const { socket, getTicket } = setup();

    socket.start();
    socket.start();
    await settle();

    expect(getTicket).toHaveBeenCalledTimes(1);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});

describe("a ticket for every connection", () => {
  it("asks for a new ticket on each reconnect, and uses each once", async () => {
    const { socket, getTicket } = setup();

    socket.start();
    await settle();
    latest().open();
    latest().drop();
    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_MS);
    latest().open();
    latest().drop();
    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_MS);

    expect(getTicket).toHaveBeenCalledTimes(3);
    expect(FakeWebSocket.instances.map((ws) => ws.url)).toEqual([
      `${URL}?ticket=t1`,
      `${URL}?ticket=t2`,
      `${URL}?ticket=t3`,
    ]);
  });
});

describe("backing off", () => {
  it("waits 1 s, 2 s, 4 s... between attempts that never get to open, and never more than 30 s", async () => {
    const { socket } = setup();
    socket.start();
    await settle();

    const waits: number[] = [];
    // One fewer than the attempts after which it gives up: the point here is
    // the growth and the cap, not the end.
    for (let attempt = 0; attempt < MAX_FAILED_CONNECTS - 1; attempt += 1) {
      const before = FakeWebSocket.instances.length;
      latest().drop();
      // The wait is the smallest time after which a new socket exists.
      let waited = 0;
      while (FakeWebSocket.instances.length === before) {
        await vi.advanceTimersByTimeAsync(500);
        waited += 500;
      }
      waits.push(waited);
    }

    expect(waits).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000]);
    expect(Math.max(...waits)).toBeLessThanOrEqual(BACKOFF_MAX_MS);
  });

  it("starts again from 1 s once a connection has opened", async () => {
    const { socket } = setup();
    socket.start();
    await settle();
    latest().drop();
    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_MS); // 1 s
    latest().drop();
    await vi.advanceTimersByTimeAsync(2 * BACKOFF_BASE_MS); // 2 s
    latest().open();
    latest().drop();

    const before = FakeWebSocket.instances.length;
    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_MS - 1);
    expect(FakeWebSocket.instances).toHaveLength(before);
    await vi.advanceTimersByTimeAsync(1);
    expect(FakeWebSocket.instances).toHaveLength(before + 1);
  });

  it("adds jitter and still never passes the cap", () => {
    expect(backoffDelay(0, () => 0)).toBe(BACKOFF_BASE_MS);
    expect(backoffDelay(0, () => 1)).toBeGreaterThan(BACKOFF_BASE_MS);
    expect(backoffDelay(50, () => 1)).toBe(BACKOFF_MAX_MS);
  });

  it("says it is reconnecting while it waits", async () => {
    const { socket, statuses } = setup();
    socket.start();
    await settle();
    latest().open();
    latest().drop();

    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.reconnecting);
  });

  it("keeps trying when the ticket could not be asked for", async () => {
    let calls = 0;
    const { socket, getTicket } = setup(() => {
      calls += 1;
      return calls === 1
        ? Promise.reject(new TypeError("Failed to fetch"))
        : Promise.resolve("t2");
    });

    socket.start();
    await settle();
    expect(FakeWebSocket.instances).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_MS);
    expect(getTicket).toHaveBeenCalledTimes(2);
    expect(latest().url).toBe(`${URL}?ticket=t2`);
  });

  it("tries again when the browser refuses to build the socket", async () => {
    let constructed = 0;
    vi.stubGlobal(
      "WebSocket",
      class extends FakeWebSocket {
        constructor(url: string) {
          constructed += 1;
          if (constructed === 1) throw new SyntaxError("bad url");
          super(url);
        }
      },
    );
    const { socket, getTicket } = setup();

    socket.start();
    await settle();
    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_MS);

    expect(getTicket).toHaveBeenCalledTimes(2);
    expect(constructed).toBe(2);
  });
});

describe("a socket the backend ended", () => {
  it("is final when the backend closes it with 1008, and says why", async () => {
    const { socket, statuses, failures, getTicket } = setup();
    socket.start();
    await settle();
    latest().open();

    latest().drop(SOCKET_CLOSE_POLICY_VIOLATION);
    await vi.advanceTimersByTimeAsync(10 * BACKOFF_MAX_MS);

    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.failed);
    expect(failures.at(-1)).toBe(CHAT_SOCKET_FAILURE.tooManyConnections);
    expect(statuses).not.toContain(CHAT_SOCKET_STATUS.reconnecting);
    // One ticket, one socket: it never asked to come back.
    expect(getTicket).toHaveBeenCalledTimes(1);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it("does not reconnect after 1008 even when the socket had never opened", async () => {
    const { socket, statuses, getTicket } = setup();
    socket.start();
    await settle();

    latest().drop(SOCKET_CLOSE_POLICY_VIOLATION);
    await vi.advanceTimersByTimeAsync(10 * BACKOFF_MAX_MS);

    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.failed);
    expect(getTicket).toHaveBeenCalledTimes(1);
  });

  it("still reconnects after an ordinary drop, with no failure reason", async () => {
    const { socket, statuses, failures } = setup();
    socket.start();
    await settle();
    latest().open();

    latest().drop();
    await vi.advanceTimersByTimeAsync(BACKOFF_BASE_MS);

    expect(statuses).not.toContain(CHAT_SOCKET_STATUS.failed);
    expect(failures.every((failure) => failure === undefined)).toBe(true);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });
});

describe("a handshake that is refused every time", () => {
  /** Drops the latest socket, which never opened, and waits until the next one exists or the attempts are over. */
  async function refuse() {
    const before = FakeWebSocket.instances.length;
    latest().drop();
    for (let waited = 0; waited < BACKOFF_MAX_MS + 1_000; waited += 500) {
      if (FakeWebSocket.instances.length > before) return;
      await vi.advanceTimersByTimeAsync(500);
    }
  }

  it(`gives up after ${MAX_FAILED_CONNECTS} connections in a row that never opened, and says it failed`, async () => {
    const { socket, statuses, failures, getTicket } = setup();
    socket.start();
    await settle();

    for (let failed = 0; failed < MAX_FAILED_CONNECTS; failed += 1) {
      await refuse();
    }
    await vi.advanceTimersByTimeAsync(10 * BACKOFF_MAX_MS);

    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.failed);
    // No reason to give: the screens say the general sentence.
    expect(failures.at(-1)).toBeUndefined();
    expect(FakeWebSocket.instances).toHaveLength(MAX_FAILED_CONNECTS);
    expect(getTicket).toHaveBeenCalledTimes(MAX_FAILED_CONNECTS);
  });

  it("is still trying one connection before that", async () => {
    const { socket, statuses } = setup();
    socket.start();
    await settle();

    for (let failed = 0; failed < MAX_FAILED_CONNECTS - 1; failed += 1) {
      await refuse();
    }

    expect(statuses).not.toContain(CHAT_SOCKET_STATUS.failed);
    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.reconnecting);
    expect(FakeWebSocket.instances).toHaveLength(MAX_FAILED_CONNECTS);
  });

  it("counts only connections in a row: one that opened starts the count again", async () => {
    const { socket, statuses } = setup();
    socket.start();
    await settle();

    for (let failed = 0; failed < MAX_FAILED_CONNECTS - 1; failed += 1) {
      await refuse();
    }
    latest().open();
    // A socket that opened and was then dropped is not a refused handshake.
    await refuse();
    for (let failed = 0; failed < MAX_FAILED_CONNECTS - 1; failed += 1) {
      await refuse();
    }

    expect(statuses).not.toContain(CHAT_SOCKET_STATUS.failed);
  });
});

describe("a session that is over", () => {
  it(`stops after ${MAX_TICKET_AUTH_FAILURES} refused tickets in a row and says it failed`, async () => {
    const { socket, getTicket, statuses } = setup(() =>
      Promise.reject(new ChatTicketRefused(false)),
    );

    socket.start();
    await settle();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(getTicket).toHaveBeenCalledTimes(MAX_TICKET_AUTH_FAILURES);
    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.failed);
    expect(FakeWebSocket.instances).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(120_000);
    expect(getTicket).toHaveBeenCalledTimes(MAX_TICKET_AUTH_FAILURES);
  });

  it("stops at once for a refusal that waiting cannot change", async () => {
    const { socket, getTicket, statuses } = setup(() =>
      Promise.reject(new ChatTicketRefused(true)),
    );

    socket.start();
    await settle();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(getTicket).toHaveBeenCalledTimes(1);
    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.failed);
  });

  it("forgets earlier refusals once a ticket was given", async () => {
    let calls = 0;
    const { socket, getTicket } = setup(() => {
      calls += 1;
      // refused, refused, given, refused, refused, given...
      return calls % 3 === 0
        ? Promise.resolve(`t${calls}`)
        : Promise.reject(new ChatTicketRefused(false));
    });

    socket.start();
    await settle();
    for (let i = 0; i < 4; i += 1) {
      await vi.advanceTimersByTimeAsync(BACKOFF_MAX_MS);
      if (FakeWebSocket.instances.length > 0) latest().drop();
    }

    expect(getTicket.mock.calls.length).toBeGreaterThan(
      MAX_TICKET_AUTH_FAILURES,
    );
  });
});

describe("closing", () => {
  it("closes the socket with 1000 and never reconnects", async () => {
    const { socket, statuses } = setup();
    socket.start();
    await settle();
    latest().open();

    socket.close();
    await vi.advanceTimersByTimeAsync(10 * BACKOFF_MAX_MS);

    expect(latest().closedWith).toBe(1000);
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(statuses.at(-1)).toBe(CHAT_SOCKET_STATUS.closed);
  });

  it("cancels the wait before a reconnect", async () => {
    const { socket, getTicket } = setup();
    socket.start();
    await settle();
    latest().open();
    latest().drop();

    socket.close();
    await vi.advanceTimersByTimeAsync(10 * BACKOFF_MAX_MS);

    expect(getTicket).toHaveBeenCalledTimes(1);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it("opens nothing when the ticket arrives after the close", async () => {
    let giveTicket: (ticket: string) => void = () => undefined;
    const { socket } = setup(
      () =>
        new Promise<string>((resolve) => {
          giveTicket = resolve;
        }),
    );
    socket.start();
    socket.close();

    giveTicket("late");
    await settle();

    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it("hands on no frame after the close", async () => {
    const { socket, frames } = setup();
    socket.start();
    await settle();
    const ws = latest();
    ws.open();
    socket.close();

    ws.receive(
      JSON.stringify({
        type: "typing",
        conversationId: "c1",
        userId: "u2",
        active: true,
      }),
    );

    expect(frames).toEqual([]);
  });
});

describe("frames", () => {
  it("hands on the frames it knows and drops the ones it does not", async () => {
    const { socket, frames } = setup();
    socket.start();
    await settle();
    latest().open();

    latest().receive(
      JSON.stringify({
        type: "typing",
        conversationId: "c1",
        userId: "u2",
        active: true,
      }),
    );
    latest().receive(JSON.stringify({ type: "presence", userId: "u2" }));
    latest().receive("not json {");
    latest().receive(JSON.stringify({ type: "read", conversationId: "c1" }));
    latest().receive(JSON.stringify(null));
    latest().receive(
      JSON.stringify({
        type: "recalled",
        conversationId: "c1",
        messageId: "m1",
        seq: 3,
      }),
    );

    expect(frames).toEqual([
      {
        type: FRAME_TYPE.typing,
        conversationId: "c1",
        userId: "u2",
        active: true,
      },
      {
        type: FRAME_TYPE.recalled,
        conversationId: "c1",
        messageId: "m1",
        seq: 3,
      },
    ]);
  });
});

describe("sending a typing signal", () => {
  it("sends nothing before the socket is open", async () => {
    const { socket } = setup();
    expect(socket.sendTyping("c1", true)).toBe(false);

    socket.start();
    await settle();
    expect(socket.sendTyping("c1", true)).toBe(false); // still connecting
    expect(latest().sent).toEqual([]);
  });

  it("sends the one frame a client may send, and only while open", async () => {
    const { socket } = setup();
    socket.start();
    await settle();
    latest().open();

    expect(socket.sendTyping("c1", true)).toBe(true);
    expect(socket.sendTyping("c1", false)).toBe(true);
    expect(latest().sent.map((text) => JSON.parse(text))).toEqual([
      { conversationId: "c1", active: true },
      { conversationId: "c1", active: false },
    ]);

    latest().drop();
    expect(socket.sendTyping("c1", true)).toBe(false);
    expect(latest().sent).toHaveLength(2);
  });
});
