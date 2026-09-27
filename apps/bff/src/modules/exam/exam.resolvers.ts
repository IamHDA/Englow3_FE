import type { Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";

export const examResolvers = {
  Query: {
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
      ctx.requireToken();
      return ctx.apis.examApi.searchAsAdmin({
        ...args,
        size: clampPageSize(args.size),
      });
    },
    exam: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.getByIdAsLearner(args.id);
    },
    placementExam: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.getPlacementExam();
    },
    attemptPaper: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.getAttemptPaper(args.attemptId);
    },
    examAttempts: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.listAttempts(
        args.page ?? 0,
        clampPageSize(args.size),
      );
    },
    examAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.getAttemptResult(args.id);
    },
  },
  Mutation: {
    startExamAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.startAttempt(args.examId);
    },
    submitExamAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.submitAttempt(args.attemptId, args.answers);
    },
    publishExam: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.publishAsAdmin(args.id);
    },
    archiveExam: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.archiveAsAdmin(args.id);
    },
    submitExamForReview: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.submitForReviewAsAdmin(args.id);
    },
    approveExam: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.approveAsAdmin(args.id);
    },
    // The note is forwarded as it stands. Trimming or defaulting it here would
    // hide a blank one from the backend's own check, which is where the rule
    // that a rejection must say why actually lives.
    rejectExam: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.rejectAsAdmin(args.id, args.note);
    },
  },
} satisfies Resolvers;
