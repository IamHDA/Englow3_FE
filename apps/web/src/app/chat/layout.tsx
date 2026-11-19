import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ChatRealtimeProvider, ChatView } from "@/features/chat";

export const metadata: Metadata = {
  title: "Tin nhắn | Englow3",
  description: "Tin nhắn riêng với bạn bè trên Englow3",
};

/**
 * The one place a chat socket is opened. It lives here, in the layout of /chat,
 * so that moving between conversations keeps it, leaving /chat closes it, and
 * no other page of the app holds a connection to the backend.
 */
export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatRealtimeProvider>
      <ChatView>{children}</ChatView>
    </ChatRealtimeProvider>
  );
}
