import type { GraphQLContext } from "../../graphql/context.js";
import type {
  SearchExamsParams,
  SearchLearnerExamsParams,
  SubmittedAnswer,
} from "./exam.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const examResolvers = {
  Query: {
    exams: async (
      _: unknown,
      args: SearchLearnerExamsParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      const page = await ctx.apis.examApi.searchAsLearner({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });

      return {
        ...page,
        items: page.items.map((item) => ({
          ...item,
          bestScore: null,
          attemptStatus: "NOT_STARTED",
        })),
      };
    },
    adminExams: (_: unknown, args: SearchExamsParams, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.searchAsAdmin({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    exam: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.getByIdAsLearner(args.id);
    },
    placementExam: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.getPlacementExam();
    },
    attemptPaper: (
      _: unknown,
      args: { attemptId: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.examApi.getAttemptPaper(args.attemptId);
    },
    examAttempt: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.getAttemptResult(args.id);
    },
  },
  Mutation: {
    startExamAttempt: (
      _: unknown,
      args: { examId: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.examApi.startAttempt(args.examId);
    },
    submitExamAttempt: (
      _: unknown,
      args: { attemptId: string; answers: SubmittedAnswer[] },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.examApi.submitAttempt(args.attemptId, args.answers);
    },
    publishExam: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.publishAsAdmin(args.id);
    },
    archiveExam: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.archiveAsAdmin(args.id);
    },
  },
};
