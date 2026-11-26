import { useApolloClient } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";

import { env } from "@/lib/env";
import { errorCodeOf } from "@/lib/errors";
import {
  ChatSocketTicketDocument,
  type ChatSocketTicketMutation,
} from "@/lib/graphql/generated";

import {
  CHAT_SOCKET_STATUS,
  ChatTicketRefused,
  createChatSocket,
  type ChatSocket,
  type ChatSocketStatus,
} from "./realtime/chatSocket";
import type { ChatFrame } from "./realtime/frames";

/**
 * The live chat connection: the same socket client the web uses, fed a
 * one-time ticket from the BFF. Without a configured socket URL it reports
 * "idle" and screens fall back to polling.
 */
export function useChatSocket(
  onFrame: (frame: ChatFrame) => void,
  onConnected?: () => void,
) {
  const client = useApolloClient();
  const [status, setStatus] = useState<ChatSocketStatus>(
    CHAT_SOCKET_STATUS.idle,
  );
  const socket = useRef<ChatSocket | null>(null);
  const frameRef = useRef(onFrame);
  const connectedRef = useRef(onConnected);
  // The socket lives across renders; it always calls the newest handlers.
  useEffect(() => {
    frameRef.current = onFrame;
    connectedRef.current = onConnected;
  });

  useEffect(() => {
    if (!env.chatWsUrl) return;
    const created = createChatSocket({
      url: `${env.chatWsUrl}/ws/chat`,
      getTicket: async () => {
        try {
          const { data } = await client.mutate<ChatSocketTicketMutation>({
            mutation: ChatSocketTicketDocument,
          });
          const ticket = data?.chatSocketTicket.ticket;
          if (!ticket) throw new Error("The BFF answered with no ticket");
          return ticket;
        } catch (failure) {
          const code = errorCodeOf(failure);
          if (code === "UNAUTHENTICATED" || code === "FORBIDDEN")
            throw new ChatTicketRefused(code === "FORBIDDEN");
          throw failure;
        }
      },
      onFrame: (frame) => frameRef.current(frame),
      onConnected: () => connectedRef.current?.(),
      onStatus: (next) => setStatus(next),
    });
    socket.current = created;
    created.start();
    return () => {
      created.close();
      socket.current = null;
    };
  }, [client]);

  return {
    status,
    live: status === CHAT_SOCKET_STATUS.open,
    sendTyping: (conversationId: string, active: boolean) =>
      socket.current?.sendTyping(conversationId, active) ?? false,
  };
}
