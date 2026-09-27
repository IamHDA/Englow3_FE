import type { GraphQLContext } from "../../graphql/context.js";
import type { SearchDictationLessonsParams } from "./dictation.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const dictationResolvers = {
  Query: {
    dictationLessons: (
      _: unknown,
      args: SearchDictationLessonsParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.searchDictationLessons({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    dictationLesson: (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.getDictationLesson(args.id);
    },
    dictationStats: (
      _: unknown,
      args: { periodDays?: number },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.getDictationStats(args.periodDays ?? 7);
    },
    dictationMistakes: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.getDictationMistakes();
    },
  },
  Mutation: {
    submitDictation: (
      _: unknown,
      args: { sentenceId: string; response: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.submitDictation(
        args.sentenceId,
        args.response,
      );
    },
  },
};
