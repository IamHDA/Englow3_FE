import type { Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";

export const flashcardResolvers = {
  Query: {
    flashcardSets: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.searchFlashcardSets({
        ...args,
        size: clampPageSize(args.size),
      });
    },
    flashcardSet: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.getFlashcardSet(args.id);
    },
    flashcardStudyQueue: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.getStudyQueue(
        args.setId,
        clampPageSize(args.limit),
      );
    },
    flashcardStats: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.getFlashcardStats(args.periodDays ?? 7);
    },
  },
  Mutation: {
    rateFlashcard: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.rateFlashcard(args.flashcardId, {
        rating: args.rating,
        timeSpentSeconds: args.timeSpentSeconds,
      });
    },
  },
} satisfies Resolvers;
