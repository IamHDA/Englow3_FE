import type { Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";

const DEFAULT_PAGE_SIZE = 20;
/** The backend's own cap on the conversation list (ChatConversationController). */
const MAX_PAGE_SIZE = 50;

const DEFAULT_HISTORY_LIMIT = 50;
/** The backend's own cap on one call for messages (ChatMessageServiceImpl.MAX_HISTORY_LIMIT). */
const MAX_HISTORY_LIMIT = 100;

export const chatResolvers = {
  Query: {
    chatConversations: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.chatApi.conversations({
        page: args.page ?? 0,
        size: clampPageSize(args.size, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
      });
    },
    chatConversation: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.chatApi.conversation(id);
    },
    chatMessages: (_, args, ctx) => {
      ctx.requireToken();
      // The cursors go as given, both or neither: choosing between them is the
      // backend's rule, and it refuses the pair.
      return ctx.apis.chatApi.messages(args.conversationId, {
        afterSeq: args.afterSeq,
        beforeSeq: args.beforeSeq,
        limit: clampPageSize(
          args.limit,
          DEFAULT_HISTORY_LIMIT,
          MAX_HISTORY_LIMIT,
        ),
      });
    },
    chatUnreadCount: async (_, __, ctx) => {
      ctx.requireToken();
      return (await ctx.apis.chatApi.unreadCount()).count;
    },
  },
  Mutation: {
    openChat: (_, { friendId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.chatApi.open(friendId);
    },
    sendChatMessage: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.chatApi.send(args.conversationId, {
        clientId: args.clientId,
        // GraphQL's null is "no text" here; the REST body leaves the key out.
        body: args.body ?? undefined,
        imageUploadId: args.imageUploadId ?? undefined,
      });
    },
    markChatRead: async (_, { conversationId, upToSeq }, ctx) => {
      ctx.requireToken();
      await ctx.apis.chatApi.markRead(conversationId, upToSeq);
      return true;
    },
    recallChatMessage: (_, { messageId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.chatApi.recall(messageId);
    },
    startChatImageUpload: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.chatApi.startImageUpload(args.conversationId, {
        contentType: args.contentType,
        contentLength: args.contentLength,
      });
    },
    chatSocketTicket: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.chatApi.socketTicket();
    },
  },
} satisfies Resolvers;
