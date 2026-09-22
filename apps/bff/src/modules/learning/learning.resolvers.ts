import type { GraphQLContext } from "../../graphql/context.js";
import type {
  ContentKind,
  ReviewRating,
  SearchContentParams,
  SearchDictationLessonsParams,
  SearchFlashcardSetsParams,
  SearchQuizzesParams,
} from "./learning.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;
const MAX_STUDY_QUEUE = 100;

export const learningResolvers = {
  Query: {
    flashcardSets: (
      _: unknown,
      args: SearchFlashcardSetsParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.searchFlashcardSets({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    flashcardSet: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.learningApi.getFlashcardSet(args.id);
    },
    flashcardStudyQueue: (
      _: unknown,
      args: { setId: string; limit?: number },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.getStudyQueue(
        args.setId,
        Math.min(args.limit ?? 20, MAX_STUDY_QUEUE),
      );
    },
    quizzes: (_: unknown, args: SearchQuizzesParams, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.learningApi.searchQuizzes({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    quizPaper: (
      _: unknown,
      args: { attemptId: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.getQuizPaper(args.attemptId);
    },
    quizAttempt: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.learningApi.getQuizAttemptResult(args.id);
    },
    dictationLessons: (
      _: unknown,
      args: SearchDictationLessonsParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.searchDictationLessons({
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
      return ctx.apis.learningApi.getDictationLesson(args.id);
    },
    flashcardStats: (
      _: unknown,
      args: { periodDays?: number },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.getFlashcardStats(args.periodDays ?? 7);
    },
    dictationStats: (
      _: unknown,
      args: { periodDays?: number },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.getDictationStats(args.periodDays ?? 7);
    },
    dictationMistakes: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.learningApi.getDictationMistakes();
    },
    dailyPath: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.learningApi.getDailyPath();
    },
    adminContent: (
      _: unknown,
      args: SearchContentParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.searchContentForAuthoring({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
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
      return ctx.apis.learningApi.rateFlashcard(args.flashcardId, {
        rating: args.rating,
        timeSpentSeconds: args.timeSpentSeconds,
      });
    },
    startQuizAttempt: (
      _: unknown,
      args: { quizId: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.startQuizAttempt(args.quizId);
    },
    submitQuizAttempt: (
      _: unknown,
      args: {
        attemptId: string;
        answers: { questionId: string; response: string }[];
      },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.submitQuizAttempt(args.attemptId, {
        answers: args.answers,
      });
    },
    submitDictation: (
      _: unknown,
      args: { sentenceId: string; response: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.submitDictation(
        args.sentenceId,
        args.response,
      );
    },
    submitContentForReview: (
      _: unknown,
      args: { kind: ContentKind; id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.submitContentForReview(args.kind, args.id);
    },
    approveContent: (
      _: unknown,
      args: { kind: ContentKind; id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.approveContent(args.kind, args.id);
    },
    // The note is forwarded as it stands. Trimming or defaulting it here would
    // hide a blank one from the backend check, which is where the rule that a
    // rejection must say why actually lives.
    rejectContent: (
      _: unknown,
      args: { kind: ContentKind; id: string; note: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.rejectContent(args.kind, args.id, args.note);
    },
    publishContent: (
      _: unknown,
      args: { kind: ContentKind; id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.publishContent(args.kind, args.id);
    },
    archiveContent: (
      _: unknown,
      args: { kind: ContentKind; id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.learningApi.archiveContent(args.kind, args.id);
    },
  },
};
