import {
  BACKOFF_BASE_MS,
  BACKOFF_JITTER_MS,
  BACKOFF_MAX_MS,
  MAX_FAILED_CONNECTS,
  MAX_TICKET_AUTH_FAILURES,
  SOCKET_CLOSE_POLICY_VIOLATION,
} from "../constants";

import { parseFrame, typingPayload, type ChatFrame } from "./frames";

/** Where a chat socket stands. `failed` is the end of the attempts; `closed` is the caller's own close(). */
export const CHAT_SOCKET_STATUS = {
  idle: "idle",
  connecting: "connecting",
  open: "open",
  reconnecting: "reconnecting",
  closed: "closed",
  failed: "failed",
} as const;

export type ChatSocketStatus =
  (typeof CHAT_SOCKET_STATUS)[keyof typeof CHAT_SOCKET_STATUS];

/**
 * Why a socket that gave up did, when the screens have something more to say
 * than "reload": the backend closed it because the person has the chat open in
 * more places than it allows. Every other end says nothing more.
 */
export const CHAT_SOCKET_FAILURE = {
  tooManyConnections: "tooManyConnections",
} as const;

export type ChatSocketFailure =
  (typeof CHAT_SOCKET_FAILURE)[keyof typeof CHAT_SOCKET_FAILURE];

/**
 * What `getTicket` throws when the BFF refused to make a ticket for want of a
 * session. `permanent` is for a refusal that waiting will not change (this
 * account is not a learner); the other kind is retried a few times first, as a
 * session can be refreshed between two attempts.
 */
export class ChatTicketRefused extends Error {
  constructor(readonly permanent: boolean) {
    super("The chat socket ticket was refused");
    this.name = "ChatTicketRefused";
  }
}

export type ChatSocketOptions = {
  /** `wss://host/ws/chat`, without the query. */
  url: string;
  /** Asks the BFF for a new single-use ticket. Called before every connection, reconnections included. */
  getTicket: () => Promise<string>;
  onFrame: (frame: ChatFrame) => void;
  /** After every successful open, the first one included: the moment to catch up over REST. */
  onConnected: () => void;
  /** `failure` accompanies `failed` when the reason is one the screens word; otherwise it is absent. */
  onStatus: (status: ChatSocketStatus, failure?: ChatSocketFailure) => void;
  /** For the jitter; a test passes a fixed one. */
  random?: () => number;
};

export type ChatSocket = {
  /** Starts connecting. Does nothing once closed. */
  start: () => void;
  /** Ends it for good: no more attempts, the socket closed with 1000. */
  close: () => void;
  /** Whether the signal went out: false while the socket is not open. */
  sendTyping: (conversationId: string, active: boolean) => boolean;
};

/**
 * How long to wait before attempt number `retry` (0 is the first retry):
 * double every time from the base, capped, plus a little jitter - and the sum
 * capped as well, so no wait ever exceeds the cap.
 */
export function backoffDelay(retry: number, random: () => number): number {
  const exponential = BACKOFF_BASE_MS * 2 ** Math.min(retry, 30);
  return Math.min(BACKOFF_MAX_MS, exponential + random() * BACKOFF_JITTER_MS);
}

/**
 * One connection to the chat socket that keeps itself open: it asks for a new
 * ticket every time (a ticket works once, for 30 seconds), opens
 * `${url}?ticket=...`, hands on every frame it understands, and when the socket
 * drops waits - 1 s, 2 s, 4 s... at most 30 s - and goes again. Two ends are
 * final: the backend closing it with 1008 (the person has too many sockets
 * open), and `MAX_FAILED_CONNECTS` connections in a row that never opened.
 * Plain TypeScript on purpose: no React, so it can be driven with a fake WebSocket
 * and fake timers.
 *
 * Neither the ticket nor a frame is ever logged.
 */
export function createChatSocket(options: ChatSocketOptions): ChatSocket {
  const random = options.random ?? Math.random;

  let socket: WebSocket | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let finished = false;
  let retry = 0;
  let authFailures = 0;
  /** Connections in a row that closed without ever opening. */
  let failedConnects = 0;
  /** Which attempt is current, so an answer to a stale one (a ticket that came back after close) is ignored. */
  let attempt = 0;

  const finish = (status: ChatSocketStatus, failure?: ChatSocketFailure) => {
    finished = true;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    options.onStatus(status, failure);
  };

  const scheduleReconnect = () => {
    if (finished) return;
    options.onStatus(CHAT_SOCKET_STATUS.reconnecting);
    timer = setTimeout(
      () => {
        timer = null;
        void connect();
      },
      backoffDelay(retry, random),
    );
    retry += 1;
  };

  const ticketFailed = (error: unknown) => {
    if (error instanceof ChatTicketRefused) {
      authFailures += 1;
      if (error.permanent || authFailures >= MAX_TICKET_AUTH_FAILURES) {
        finish(CHAT_SOCKET_STATUS.failed);
        return;
      }
    }
    scheduleReconnect();
  };

  async function connect(): Promise<void> {
    if (finished) return;
    const current = ++attempt;
    let ticket: string;
    try {
      ticket = await options.getTicket();
    } catch (error) {
      if (finished || current !== attempt) return;
      ticketFailed(error);
      return;
    }
    if (finished || current !== attempt) return;
    authFailures = 0;

    let opened: WebSocket;
    try {
      opened = new WebSocket(
        `${options.url}?ticket=${encodeURIComponent(ticket)}`,
      );
    } catch {
      // An address the browser refuses, or a page that may not open this kind
      // of socket: no ticket was spent, and the next attempt asks for a new one.
      scheduleReconnect();
      return;
    }
    socket = opened;
    let reachedOpen = false;

    opened.onopen = () => {
      if (socket !== opened) return;
      reachedOpen = true;
      retry = 0;
      failedConnects = 0;
      options.onStatus(CHAT_SOCKET_STATUS.open);
      options.onConnected();
    };
    opened.onmessage = (event: MessageEvent) => {
      if (socket !== opened) return;
      const frame = parseFrame(event.data);
      if (frame) options.onFrame(frame);
    };
    opened.onclose = (event: { code?: number }) => {
      // The caller's own close() has already let go of this socket.
      const current = socket === opened;
      if (current) socket = null;
      if (!current || finished) return;
      if (event.code === SOCKET_CLOSE_POLICY_VIOLATION) {
        finish(
          CHAT_SOCKET_STATUS.failed,
          CHAT_SOCKET_FAILURE.tooManyConnections,
        );
        return;
      }
      if (!reachedOpen) {
        failedConnects += 1;
        if (failedConnects >= MAX_FAILED_CONNECTS) {
          finish(CHAT_SOCKET_STATUS.failed);
          return;
        }
      }
      scheduleReconnect();
    };
    // A failed handshake or a dropped connection ends in close, which decides
    // whether to retry; the error event itself carries nothing worth acting on.
    opened.onerror = () => undefined;
  }

  return {
    start() {
      if (finished || attempt > 0) return;
      options.onStatus(CHAT_SOCKET_STATUS.connecting);
      void connect();
    },
    close() {
      const closing = socket;
      socket = null;
      finish(CHAT_SOCKET_STATUS.closed);
      closing?.close(1000);
    },
    sendTyping(conversationId, active) {
      if (socket === null || socket.readyState !== WebSocket.OPEN) return false;
      socket.send(typingPayload(conversationId, active));
      return true;
    },
  };
}
