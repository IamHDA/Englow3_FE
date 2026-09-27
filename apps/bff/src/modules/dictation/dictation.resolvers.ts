import type { Resolvers } from "../../generated/graphql.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const dictationResolvers = {
  Query: {
    dictationLessons: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.searchDictationLessons({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    dictationLesson: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.getDictationLesson(args.id);
    },
    dictationStats: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.getDictationStats(args.periodDays ?? 7);
    },
    dictationMistakes: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.getDictationMistakes();
    },
  },
  Mutation: {
    submitDictation: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.submitDictation(
        args.sentenceId,
        args.response,
      );
    },
  },
} satisfies Resolvers;
