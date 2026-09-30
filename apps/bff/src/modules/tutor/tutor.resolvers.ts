import { GraphQLError } from "graphql";

import type { Resolvers } from "../../generated/graphql.js";

/**
 * The longest question that will be forwarded. Matches the backend's own limit
 * so an over-long message is refused here rather than after a round trip, and
 * capped at all because the whole thing is re-sent with every later question in
 * the thread.
 */
const MAX_MESSAGE_LENGTH = 4_000;

export const tutorResolvers = {
  Query: {
    tutorConversations: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.getConversations();
    },
    tutorConversation: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.getConversation(args.id);
    },
  },
  Mutation: {
    // The message is forwarded as typed. Trimming or truncating it here would
    // send the tutor something the learner did not write, and they would be
    // reading an answer to a question they never asked.
    sendTutorMessage: (_, args, ctx) => {
      ctx.requireToken();
      if (args.message.length > MAX_MESSAGE_LENGTH) {
        throw new GraphQLError(
          `A message may be at most ${MAX_MESSAGE_LENGTH} characters`,
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }
      return ctx.apis.tutorApi.sendMessage(args);
    },
    archiveTutorConversation: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.archiveConversation(args.id);
    },
    reportTutorMessage: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.reportMessage(
        args.conversationId,
        args.messageId,
        args.note,
      );
    },
  },
} satisfies Resolvers;
