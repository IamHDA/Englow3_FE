import type { GraphQLContext } from "../../graphql/context.js";
import type { SearchSpeakingPromptsParams } from "./speaking.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const speakingResolvers = {
  Query: {
    speakingPrompts: (
      _: unknown,
      args: SearchSpeakingPromptsParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.searchPrompts({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    speakingPrompt: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.getPrompt(args.id);
    },
    speakingAttempt: (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.getAttempt(args.id);
    },
    speakingAttempts: (
      _: unknown,
      args: { promptId: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.getAttemptHistory(args.promptId);
    },
  },
  Mutation: {
    startSpeakingAttempt: (
      _: unknown,
      args: { promptId: string; contentType: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.startAttempt(args.promptId, args.contentType);
    },
    // The content type is forwarded as given. Defaulting an unsupported one to
    // something the backend accepts would upload audio that is not what it
    // claims to be, and the failure would surface much later and read as a
    // provider problem.
    submitSpeakingAttempt: (
      _: unknown,
      args: { attemptId: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.speakingApi.submitAttempt(args.attemptId);
    },
  },
};
