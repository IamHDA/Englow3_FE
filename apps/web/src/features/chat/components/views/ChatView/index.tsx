"use client";

import { Alert, Box, Button, Flex, Paper, Stack } from "@mantine/core";
import { AlertCircle, RotateCw } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { isBackOfficeRole, useAuth } from "@/features/auth";
import { useChatConversationsQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CONVERSATION_PAGE_SIZE } from "../../../constants/chat";
import { useChatListRefresh } from "../../../hooks/useChatListRefresh";
import { useChatRealtime } from "../../../hooks/useChatRealtime";
import { useRefreshChatLists } from "../../../hooks/useRefreshChatLists";
import { ChatLearnersOnly } from "../../blocks/ChatLearnersOnly";
import { ConnectionNotice } from "../../blocks/ConnectionNotice";
import { ConversationList } from "../../blocks/ConversationList";
import { ConversationListSkeleton } from "../../blocks/ConversationList/ConversationListSkeleton";

import classes from "./ChatView.module.css";

/**
 * Everything under /chat but the conversation itself: the list of conversations
 * beside the open one (the route's page, passed as children), the strip that
 * says when new messages are not arriving, and - for staff and admin - the
 * notice that messages are for learners, with no request made for them.
 *
 * It lives in the layout, so moving from one conversation to another changes
 * only the right-hand side: the list keeps its place, and so does the socket.
 * On a phone one of the two shows at a time.
 */
export function ChatView({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const copy = t.chat.list;
  const { session } = useAuth();
  const isLearner = session !== null && !isBackOfficeRole(session.role);
  const params = useParams<{ conversationId?: string }>();
  const conversationId = params.conversationId ?? null;

  const realtime = useChatRealtime();
  const refreshLists = useRefreshChatLists();
  useChatListRefresh({
    subscribe: realtime.subscribe,
    connectionCount: realtime.connectionCount,
    refresh: refreshLists,
  });

  const [page, setPage] = useState(1);
  const { data, error, loading, refetch } = useChatConversationsQuery({
    variables: { page: page - 1, size: CONVERSATION_PAGE_SIZE },
    // The list changes whenever anyone writes; a visit always asks again and
    // shows what it has meanwhile.
    fetchPolicy: "cache-and-network",
    skip: !isLearner,
    // Needs the session, which a server render does not have.
    ssr: false,
  });

  if (!isLearner) {
    return (
      <Box className={classes.root}>
        <ChatLearnersOnly />
      </Box>
    );
  }

  const conversations = data?.chatConversations;
  let list: ReactNode;
  if (!conversations) {
    list =
      error && !loading ? (
        <Alert
          m="md"
          color="warn"
          radius="md"
          icon={<AlertCircle size={20} aria-hidden="true" />}
          title={copy.loadErrorTitle}
        >
          {copy.loadErrorDescription}
          <Button
            variant="light"
            color="warn"
            size="sm"
            mt="sm"
            display="block"
            leftSection={<RotateCw size={16} aria-hidden="true" />}
            onClick={() => void refetch().catch(() => undefined)}
          >
            {copy.retry}
          </Button>
        </Alert>
      ) : (
        <ConversationListSkeleton />
      );
  } else {
    list = (
      <ConversationList
        items={conversations.items}
        selectedId={conversationId}
        page={page}
        totalPages={conversations.totalPages}
        onPageChange={setPage}
      />
    );
  }

  return (
    <Stack className={classes.root} gap="sm">
      <ConnectionNotice
        status={realtime.status}
        onReload={() => window.location.reload()}
      />
      <Flex
        className={classes.shell}
        flex={1}
        mih={0}
        gap="md"
        data-conversation={conversationId ?? undefined}
      >
        <Paper
          withBorder
          radius="lg"
          className={`${classes.paper} ${classes.list}`}
        >
          {list}
        </Paper>
        <Paper
          withBorder
          radius="lg"
          className={`${classes.paper} ${classes.pane}`}
        >
          {children}
        </Paper>
      </Flex>
    </Stack>
  );
}
