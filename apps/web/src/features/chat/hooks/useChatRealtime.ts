"use client";

import { createContext, useContext } from "react";

import type { ChatSocketStatus } from "../realtime/chatSocket";
import type { ChatFrame } from "../realtime/frames";

/** What the chat screens get from the one socket the chat area holds. */
export type ChatRealtime = {
  status: ChatSocketStatus;
  /** Goes up by one every time the socket opens - the first time included - so a screen knows to catch up. */
  connectionCount: number;
  /** Listens to every frame; returns the way to stop. Stable. */
  subscribe: (listener: (frame: ChatFrame) => void) => () => void;
  /** The one thing a client sends. False while the socket is not open. Stable. */
  sendTyping: (conversationId: string, active: boolean) => boolean;
};

export const ChatRealtimeContext = createContext<ChatRealtime | null>(null);

/** The chat area's socket. Only the screens under `app/chat` have one. */
export function useChatRealtime(): ChatRealtime {
  const value = useContext(ChatRealtimeContext);
  if (!value) {
    throw new Error(
      "useChatRealtime must be used inside <ChatRealtimeProvider>",
    );
  }
  return value;
}
