import type { Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";

export const quizResolvers = {
  Query: {
    quizzes: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.quizApi.searchQuizzes({
        ...args,
        size: clampPageSize(args.size),
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
