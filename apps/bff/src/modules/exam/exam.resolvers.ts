import type { GraphQLContext } from "../../graphql/context.js";
import type { SearchExamsParams } from "./exam.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const examResolvers = {
  Query: {
<<<<<<< Updated upstream
    adminExams: (_: unknown, args: SearchExamsParams, ctx: GraphQLContext) => {
=======
    activeExamAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.activeAttempt(args.examId, args.mode);
    },
    examDraft: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.draft(args.attemptId);
    },
    exams: async (_, args, ctx) => {
      ctx.requireToken();
      // The two per-learner figures used to be filled in here with null and
      // NOT_STARTED because the backend did not supply them. It does now, so
      // the page passes through untouched.
      return ctx.apis.examApi.searchAsLearner({
        ...args,
        size: clampPageSize(args.size),
      });
    },
    adminExams: (_, args, ctx) => {
>>>>>>> Stashed changes
      ctx.requireToken();
      return ctx.apis.examApi.searchAsAdmin({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
  },
  Mutation: {
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
