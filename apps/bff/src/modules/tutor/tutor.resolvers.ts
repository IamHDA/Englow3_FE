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
  TutorConversationSummary: {
    useLearningContext: (conversation) =>
      conversation.useLearningContext ?? true,
  },
  TutorUsage: {
    allowedModes: (usage) =>
      usage.allowedModes ?? [
        "GENERAL",
        "CORRECTION",
        "CONVERSATION",
        "PRACTICE",
      ],
  },
  TutorMessage: {
    revision: (message) => message.revision ?? 0,
    restartCount: (message) =>
      message.restartCount ?? Math.min(message.revision ?? 0, 3),
    sources: (message) => message.sources ?? [],
  },
  Query: {
    tutorMemory: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.memory(args.conversationId);
    },
    tutorPolicy: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.policy();
    },
    tutorReplyHistory: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.replyHistory(
        args.conversationId,
        args.messageId,
      );
    },
    tutorOperations: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.operations();
    },
    tutorResources: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.resources(
        args.status ?? "",
        Math.max(0, args.page ?? 0),
      );
    },
    tutorResource: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.resource(args.id);
    },
    tutorReports: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.reports(
        args.status ?? "",
        Math.max(0, args.page ?? 0),
      );
    },
    tutorReport: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.report(args.id);
    },
    tutorStaffMembers: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.staff();
    },
    tutorUsage: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.getUsage();
    },
    tutorReceipt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.getReceipt(args.clientMessageId);
    },
    tutorHistory: (_, args, ctx) => {
      ctx.requireToken();
      if (
        (args.page ?? 0) < 0 ||
        (args.size ?? 20) < 1 ||
        (args.size ?? 20) > 100 ||
        (args.search?.length ?? 0) > 200
      )
        throw new GraphQLError("Invalid conversation page", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      return ctx.apis.tutorApi.getHistory(
        args.page ?? 0,
        args.size ?? 20,
        args.search ?? "",
        args.archived ?? false,
      );
    },
    tutorMessages: (_, args, ctx) => {
      ctx.requireToken();
      if (
        (args.page ?? 0) < 0 ||
        (args.size ?? 30) < 1 ||
        (args.size ?? 30) > 100
      )
        throw new GraphQLError("Invalid message page", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      return ctx.apis.tutorApi.getMessages(
        args.id,
        args.page ?? 0,
        args.size ?? 30,
      );
    },
    tutorReply: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.getReply(args.conversationId, args.messageId);
    },
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
    summarizeTutorConversation: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.summarize(
        args.conversationId,
        args.clientMessageId,
      );
    },
    clearTutorMemory: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.clearMemory(args.conversationId);
    },
    updateTutorPolicy: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.updatePolicy(args.input);
    },
    selectTutorReply: (_, args, ctx) => {
      ctx.requireToken();
      if (args.revision < 0)
        throw new GraphQLError("Invalid answer revision", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      return ctx.apis.tutorApi.selectReply(
        args.conversationId,
        args.messageId,
        args.revision,
        args.clientMessageId,
      );
    },
    branchTutorConversation: (_, args, ctx) => {
      ctx.requireToken();
      if (!args.message.trim() || args.message.length > MAX_MESSAGE_LENGTH)
        throw new GraphQLError("Use a question between 1 and 4000 characters", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      return ctx.apis.tutorApi.branch(
        args.conversationId,
        args.messageId,
        args.message,
        args.clientMessageId,
        args.personalized,
      );
    },
    createTutorResource: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.createResource(args.input);
    },
    updateTutorResource: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.updateResource(args.id, args.input);
    },
    reviewTutorResource: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.resourceAction(args.id, args.input);
    },
    reviewTutorReport: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.reportAction(args.id, args.input);
    },
    restoreTutorConversation: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.restoreConversation(args.id);
    },
    renameTutorConversation: (_, args, ctx) => {
      ctx.requireToken();
      if (!args.title.trim() || args.title.trim().length > 200)
        throw new GraphQLError("Use a title between 1 and 200 characters", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      return ctx.apis.tutorApi.renameConversation(args.id, args.title);
    },
    retryTutorReply: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.restart(
        args.conversationId,
        args.messageId,
        args.clientMessageId,
        false,
      );
    },
    regenerateTutorReply: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.restart(
        args.conversationId,
        args.messageId,
        args.clientMessageId,
        true,
      );
    },
    cancelTutorReply: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.tutorApi.cancel(args.conversationId, args.messageId);
    },
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
