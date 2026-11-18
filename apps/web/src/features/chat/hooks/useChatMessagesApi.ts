"use client";

import { useApolloClient } from "@apollo/client/react";
import { useMemo } from "react";

import { ChatMessagesDocument } from "@/lib/graphql/generated";
import {
  useRecallChatMessageMutation,
  useSendChatMessageMutation,
  useStartChatImageUploadMutation,
} from "@/lib/graphql/generated/hooks";

import type { ChatMessagesApi } from "./useConversationMessages";
import { useImageUpload } from "./useImageUpload";

/**
 * The backend calls `useConversationMessages` is given, over Apollo: the
 * messages fetched fresh from the network (a history page is never worth
 * serving from the cache - a recall or a new link may have happened since),
 * the three mutations, and the image upload. Also hands back `validateImage`,
 * for the composer to refuse a file before it is chosen.
 */
export function useChatMessagesApi() {
  const client = useApolloClient();
  const [send] = useSendChatMessageMutation();
  const [recall] = useRecallChatMessageMutation();
  const [startImageUpload] = useStartChatImageUploadMutation();

  const { validate, upload } = useImageUpload({
    startUpload: async (variables) => {
      const { data } = await startImageUpload({ variables });
      if (!data) throw new Error("The BFF answered with no upload");
      return data.startChatImageUpload;
    },
  });

  const api = useMemo<ChatMessagesApi>(
    () => ({
      fetchMessages: async (variables) => {
        const { data } = await client.query({
          query: ChatMessagesDocument,
          variables,
          fetchPolicy: "network-only",
        });
        return data?.chatMessages ?? [];
      },
      sendMessage: async (variables) => {
        const { data } = await send({ variables });
        if (!data) throw new Error("The BFF answered with no message");
        return data.sendChatMessage;
      },
      recallMessage: async (messageId) => {
        const { data } = await recall({ variables: { messageId } });
        if (!data) throw new Error("The BFF answered with no message");
        return data.recallChatMessage;
      },
      uploadImage: upload,
    }),
    [client, send, recall, upload],
  );

  return { api, validateImage: validate };
}
