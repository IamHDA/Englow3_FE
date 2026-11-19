"use client";

import { useApolloClient } from "@apollo/client/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { chatSocketUrl } from "@/config/chat";
import { ChatSocketTicketDocument } from "@/lib/graphql/generated";
import { errorCodeOf } from "@/shared/network/loadError";

import {
  CHAT_SOCKET_STATUS,
  ChatTicketRefused,
  createChatSocket,
  type ChatSocket,
  type ChatSocketFailure,
  type ChatSocketStatus,
} from "../realtime/chatSocket";
import type { ChatFrame } from "../realtime/frames";

import type { ChatRealtime } from "./useChatRealtime";

/** The codes the BFF answers a ticket with when the session is the problem. */
const SESSION_CODE = "UNAUTHENTICATED";
const NOT_A_LEARNER_CODE = "FORBIDDEN";

/**
 * The socket's life inside React: open while `enabled`, closed the moment it
 * is not or the component goes, and never opened at all for an account that
 * may not chat. Every connection - the first and each reconnect - asks the BFF
 * for a new ticket, and the ticket is never cached, kept or logged. It is asked
 * for with `client.mutate` and `no-cache` rather than with the mutation hook,
 * because the hook keeps the last answer in the component's state: a credential
 * held by a React component for as long as the chat is open.
 *
 * `enabled` false means no socket and no ticket request.
 */
export function useChatSocket({ enabled }: { enabled: boolean }): ChatRealtime {
  const url = chatSocketUrl();
  const [{ status, failure }, setReport] = useState<{
    status: ChatSocketStatus;
    failure: ChatSocketFailure | null;
  }>({ status: CHAT_SOCKET_STATUS.idle, failure: null });
  const [connectionCount, setConnectionCount] = useState(0);
  const listeners = useRef(new Set<(frame: ChatFrame) => void>());
  const socket = useRef<ChatSocket | null>(null);

  const client = useApolloClient();
  // The socket outlives renders; it must ask with the client of the latest one.
  const clientRef = useRef(client);
  useEffect(() => {
    clientRef.current = client;
  }, [client]);

  useEffect(() => {
    if (!enabled || !url) return;
    const next = createChatSocket({
      url,
      getTicket: async () => {
        try {
          const { data } = await clientRef.current.mutate({
            mutation: ChatSocketTicketDocument,
            // A ticket works once. Writing it to the cache would keep a
            // credential for nothing.
            fetchPolicy: "no-cache",
          });
          const ticket = data?.chatSocketTicket.ticket;
          if (!ticket) throw new Error("The BFF answered with no ticket");
          return ticket;
        } catch (error) {
          const code = errorCodeOf(error);
          if (code === SESSION_CODE) throw new ChatTicketRefused(false);
          if (code === NOT_A_LEARNER_CODE) throw new ChatTicketRefused(true);
          throw error;
        }
      },
      onFrame: (frame) =>
        listeners.current.forEach((listener) => listener(frame)),
      onConnected: () => setConnectionCount((count) => count + 1),
      onStatus: (next, why) =>
        setReport({ status: next, failure: why ?? null }),
    });
    socket.current = next;
    next.start();
    return () => {
      next.close();
      socket.current = null;
    };
  }, [enabled, url]);

  const subscribe = useCallback((listener: (frame: ChatFrame) => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const sendTyping = useCallback(
    (conversationId: string, active: boolean) =>
      socket.current?.sendTyping(conversationId, active) ?? false,
    [],
  );

  // Not reconnecting, not open: simply not there. And no address to connect to
  // is a failure the screens say so about, not a socket forever "connecting".
  const shown = !enabled
    ? CHAT_SOCKET_STATUS.idle
    : !url
      ? CHAT_SOCKET_STATUS.failed
      : status;

  return {
    status: shown,
    failure: shown === CHAT_SOCKET_STATUS.failed ? failure : null,
    connectionCount,
    subscribe,
    sendTyping,
  };
}
