import type { Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";

export const flashcardResolvers = {
  Query: {
    flashcardCatalogueInfo: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.catalogueInfo();
    },
    flashcardSetSummary: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.setSummary(args.id);
    },
    flashcardSets: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.searchFlashcardSets({
        ...args,
        size: clampPageSize(args.size),
      });
    },
    flashcardSet: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.getFlashcardSet(
        args.id,
        args.page ?? 0,
        clampPageSize(args.size ?? 30),
      );
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
