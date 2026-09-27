import type { GraphQLContext } from "../../graphql/context.js";
import type {
  ReviewRating,
  SearchFlashcardSetsParams,
} from "./flashcard.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;
const MAX_STUDY_QUEUE = 100;

export const flashcardResolvers = {
  Query: {
    flashcardSets: (
      _: unknown,
      args: SearchFlashcardSetsParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.searchFlashcardSets({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    flashcardSet: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.getFlashcardSet(args.id);
    },
    flashcardStudyQueue: (
      _: unknown,
      args: { setId: string; limit?: number },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.getStudyQueue(
        args.setId,
        Math.min(args.limit ?? 20, MAX_STUDY_QUEUE),
      );
    },
    flashcardStats: (
      _: unknown,
      args: { periodDays?: number },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.getFlashcardStats(args.periodDays ?? 7);
    },
  },
  Mutation: {
    rateFlashcard: (
      _: unknown,
      args: {
        flashcardId: string;
        rating: ReviewRating;
        timeSpentSeconds: number;
      },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.flashcardApi.rateFlashcard(args.flashcardId, {
        rating: args.rating,
        timeSpentSeconds: args.timeSpentSeconds,
      });
    },
  },
};
