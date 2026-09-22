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
      // The two per-learner figures used to be filled in here with null and
      // NOT_STARTED because the backend did not supply them. It does now, so
      // the page passes through untouched.
      return ctx.apis.examApi.searchAsLearner({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
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
    examAttempts: (
      _: unknown,
      args: { page?: number; size?: number },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.examApi.listAttempts(
        args.page ?? 0,
        Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      );
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
    submitExamForReview: (
      _: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.examApi.submitForReviewAsAdmin(args.id);
    },
    approveExam: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.approveAsAdmin(args.id);
    },
    // The note is forwarded as it stands. Trimming or defaulting it here would
    // hide a blank one from the backend's own check, which is where the rule
    // that a rejection must say why actually lives.
    rejectExam: (
      _: unknown,
      args: { id: string; note: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.examApi.rejectAsAdmin(args.id, args.note);
    },
  },
};
