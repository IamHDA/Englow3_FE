"use client";

import { MessagesSquare } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { ChatEmptyState } from "../ChatEmptyState";

/** The pane of /chat itself, where no conversation is open: on a wide screen, beside the list. */
export function ChatPanePlaceholder() {
  const copy = useLanguage().t.chat.pane;
  return (
    <ChatEmptyState
      icon={<MessagesSquare size={24} aria-hidden="true" />}
      title={copy.placeholderTitle}
      description={copy.placeholderDescription}
    />
  );
}
