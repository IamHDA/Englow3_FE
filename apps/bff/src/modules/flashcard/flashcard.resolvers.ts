import type { Resolvers } from "../../generated/graphql.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;
const MAX_STUDY_QUEUE = 100;

export const flashcardResolvers = {
  Query: {
    flashcardSets: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.searchFlashcardSets({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
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
        Math.min(args.limit ?? 20, MAX_STUDY_QUEUE),
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
