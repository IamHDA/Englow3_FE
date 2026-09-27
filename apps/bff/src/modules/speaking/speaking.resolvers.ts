import type { Resolvers } from "../../generated/graphql.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const speakingResolvers = {
  Query: {
    speakingPrompts: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.searchPrompts({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    speakingPrompt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.getPrompt(args.id);
    },
    speakingAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.getAttempt(args.id);
    },
    speakingAttempts: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.getAttemptHistory(args.promptId);
    },
  },
  Mutation: {
    startSpeakingAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.startAttempt(
        args.promptId,
        args.contentType,
        args.contentLength,
      );
    },
    // The content type is forwarded as given. Defaulting an unsupported one to
    // something the backend accepts would upload audio that is not what it
    // claims to be, and the failure would surface much later and read as a
    // provider problem.
    submitSpeakingAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.submitAttempt(args.attemptId);
    },
  },
} satisfies Resolvers;
