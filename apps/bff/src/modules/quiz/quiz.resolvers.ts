import type { Resolvers } from "../../generated/graphql.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const quizResolvers = {
  Query: {
    quizzes: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.quizApi.searchQuizzes({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    quizPaper: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.quizApi.getQuizPaper(args.attemptId);
    },
    quizAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.quizApi.getQuizAttemptResult(args.id);
    },
  },
  Mutation: {
    startQuizAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.quizApi.startQuizAttempt(args.quizId);
    },
    submitQuizAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.quizApi.submitQuizAttempt(args.attemptId, {
        answers: args.answers,
      });
    },
  },
} satisfies Resolvers;
