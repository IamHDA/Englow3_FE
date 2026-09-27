import type { GraphQLContext } from "../../graphql/context.js";
import type { SearchQuizzesParams } from "./quiz.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const quizResolvers = {
  Query: {
    quizzes: (_: unknown, args: SearchQuizzesParams, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.quizApi.searchQuizzes({
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
      return ctx.apis.quizApi.getQuizPaper(args.attemptId);
    },
    quizAttempt: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.quizApi.getQuizAttemptResult(args.id);
    },
  },
  Mutation: {
    startQuizAttempt: (
      _: unknown,
      args: { quizId: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.quizApi.startQuizAttempt(args.quizId);
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
      return ctx.apis.quizApi.submitQuizAttempt(args.attemptId, {
        answers: args.answers,
      });
    },
  },
};
