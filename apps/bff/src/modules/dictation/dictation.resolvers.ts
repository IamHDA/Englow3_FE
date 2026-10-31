import type { Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";

export const dictationResolvers = {
  Query: {
    dictationLessons: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.dictationApi.searchDictationLessons({
        ...args,
        size: clampPageSize(args.size),
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
