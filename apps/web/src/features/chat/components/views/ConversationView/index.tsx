"use client";

import { notifications } from "@mantine/notifications";
import { useCallback, useMemo, useState } from "react";

import {
  useChatConversationQuery,
  useChatMessagesQuery,
  useMarkChatReadMutation,
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  BACKEND_CODES,
  CHAT_ROUTES,
  CONVERSATION_LOCK,
  MESSAGE_PAGE_SIZE,
  type ConversationLock,
} from "../../../constants/chat";
import { useChatErrorMessage } from "../../../hooks/useChatErrorMessage";
import { useChatMessagesApi } from "../../../hooks/useChatMessagesApi";
import { useChatRealtime } from "../../../hooks/useChatRealtime";
import { useConversationMessages } from "../../../hooks/useConversationMessages";
import { useMarkRead } from "../../../hooks/useMarkRead";
import { useRefreshChatLists } from "../../../hooks/useRefreshChatLists";
import { useTypingSignal } from "../../../hooks/useTypingSignal";
import { highestSeq, isOwnMessage } from "../../../realtime/messageList";
import { ConversationPane } from "../../blocks/ConversationPane";
import { ConversationPaneSkeleton } from "../../blocks/ConversationPane/ConversationPaneSkeleton";

/**
 * /chat/[conversationId]: one conversation. Asks for the conversation (who it
 * is with, and whether the two can still talk) and its newest messages, and
 * gives the rest to the hooks: the live list, "is typing", the read mark. The
 * route keys this by the conversation, so opening another starts it afresh.
 *
 * What the backend refuses is not decided here: a send refused because the two
 * are no longer friends locks the box at once and asks the backend again, and
 * the conversation's own answer (`canSend`, `otherUser`) has the last word.
 */
export function ConversationView({
  conversationId,
}: {
  conversationId: string;
}) {
  const { t } = useLanguage();
  const copy = t.chat;
  const realtime = useChatRealtime();
  const errorMessage = useChatErrorMessage();
  const refreshLists = useRefreshChatLists();

  const conversationQuery = useChatConversationQuery({
    variables: { id: conversationId },
    // Whether they are still friends changes without this screen's help.
    fetchPolicy: "cache-and-network",
    // Needs the session, which a server render does not have.
    ssr: false,
  });
  const messagesQuery = useChatMessagesQuery({
    variables: { conversationId, limit: MESSAGE_PAGE_SIZE },
    // A history page is never worth serving from the cache: a recall or a new
    // picture link may have happened since.
    fetchPolicy: "network-only",
    ssr: false,
  });
  const conversation = conversationQuery.data?.chatConversation;
  const partner = conversation?.otherUser ?? null;

  /* ---- Locking the box -------------------------------------------------- */

  // Set the moment a send is refused for "no longer friends", before the
  // conversation has been asked again; cleared once it has answered.
  const [refusedLock, setRefusedLock] = useState<ConversationLock | null>(null);
  const { refetch: refetchConversation } = conversationQuery;
  const onSendRefused = useCallback(
    (code: string) => {
      setRefusedLock(
        code === BACKEND_CODES.partnerGone
          ? CONVERSATION_LOCK.partnerGone
          : CONVERSATION_LOCK.notFriends,
      );
      void refetchConversation()
        .then(() => setRefusedLock(null))
        .catch(() => undefined);
    },
    [refetchConversation],
  );

  /* ---- The live messages ------------------------------------------------ */

  const { api, validateImage } = useChatMessagesApi();
  const messages = useConversationMessages({
    conversationId,
    partnerId: partner?.userId ?? null,
    seed: messagesQuery.data?.chatMessages,
    subscribe: realtime.subscribe,
    connectionCount: realtime.connectionCount,
    api,
    onSendRefused,
  });
  const typing = useTypingSignal({
    conversationId,
    partnerId: partner?.userId ?? null,
    sendTyping: realtime.sendTyping,
    subscribe: realtime.subscribe,
  });

  const [markChatRead] = useMarkChatReadMutation();
  const incomingSeq = useMemo(
    () => highestSeq(messages.entries.filter((entry) => !isOwnMessage(entry))),
    [messages.entries],
  );
  useMarkRead({
    upToSeq: conversation ? incomingSeq : null,
    readSeq: conversation?.lastReadSeq ?? 0,
    markRead: (upToSeq) =>
      markChatRead({ variables: { conversationId, upToSeq } }),
    onMarked: () => void refreshLists(),
  });

  /* ---- States ----------------------------------------------------------- */

  const failure =
    conversationQuery.error ??
    (messagesQuery.data ? undefined : messagesQuery.error);
  if (!conversation && failure) {
    return (
      <LoadErrorState
        error={failure}
        thing={copy.pane.thing}
        back={{ href: CHAT_ROUTES.list, label: copy.pane.notFoundBack }}
        notFoundDescription={copy.pane.notFoundDescription}
        onRetry={() => {
          void conversationQuery.refetch().catch(() => undefined);
          void messagesQuery.refetch().catch(() => undefined);
        }}
      />
    );
  }
  if (!conversation) return <ConversationPaneSkeleton />;

  let lock: ConversationLock | null = null;
  if (partner === null) lock = CONVERSATION_LOCK.partnerGone;
  else if (conversation.canSend === false) lock = CONVERSATION_LOCK.notFriends;
  else lock = refusedLock;

  return (
    <ConversationPane
      partner={partner}
      messagesLoaded={messagesQuery.data !== undefined}
      entries={messages.entries}
      partnerReadSeq={messages.partnerReadSeq}
      hasOlder={messages.hasOlder}
      loadingOlder={messages.loadingOlder}
      partnerTyping={typing.partnerTyping}
      lock={lock}
      onLoadOlder={() => void messages.loadOlder()}
      onRetry={messages.retry}
      onDismiss={messages.dismiss}
      onRecall={async (messageId) => {
        try {
          await messages.recall(messageId);
        } catch (error) {
          notifications.show({
            color: "warn",
            title: copy.message.recallFailedTitle,
            message: errorMessage(error),
          });
        }
      }}
      onImageError={(entry) => void messages.refreshImage(entry)}
      onSend={messages.send}
      onTyping={typing.onInput}
      onStopTyping={typing.stop}
      validateImage={validateImage}
    />
  );
}
