"use client";

import type { ReactNode } from "react";

import { isBackOfficeRole, useAuth } from "@/features/auth";

import { ChatRealtimeContext } from "../../../hooks/useChatRealtime";
import { useChatSocket } from "../../../hooks/useChatSocket";

/**
 * Holds the one chat socket for everything under /chat, and nothing else does:
 * it is mounted by app/chat/layout.tsx only, so a learner anywhere else holds
 * no connection to the backend, and leaving /chat unmounts it and closes the
 * socket. Staff and admin have no chat, so for them there is no socket and no
 * ticket is asked for.
 */
export function ChatRealtimeProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const realtime = useChatSocket({
    enabled: session !== null && !isBackOfficeRole(session.role),
  });

  return <ChatRealtimeContext value={realtime}>{children}</ChatRealtimeContext>;
}
