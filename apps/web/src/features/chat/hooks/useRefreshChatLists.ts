"use client";

import { useApolloClient } from "@apollo/client/react";
import { useCallback } from "react";

import { LIST_QUERY_NAMES } from "../constants/chat";

/**
 * Fetches again whatever on screen shows the conversation list or the unread
 * count - the list in the chat area and the header's indicator. A failure only
 * leaves them as they were.
 */
export function useRefreshChatLists() {
  const client = useApolloClient();

  return useCallback(async () => {
    try {
      await client.refetchQueries({ include: [...LIST_QUERY_NAMES] });
    } catch {
      // The old numbers stay until the next time something asks.
    }
  }, [client]);
}
