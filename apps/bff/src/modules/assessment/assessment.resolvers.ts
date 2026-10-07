import type { Resolvers } from "../../generated/graphql.js";
export const assessmentResolvers = {
  Query: {
    assessmentNotifications: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.notifications(a.page ?? 0);
    },
    assessmentWorkload: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.workload();
    },
    authoringAssessmentTask: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.authoringTask(a.id);
    },
    assessmentReviews: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.reviews(a.id);
    },
    assessmentCapabilities: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.capabilities();
    },
    assessmentTasks: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.tasks(a.skill, a.page ?? 0);
    },
    assessmentTask: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.task(a.id);
    },
    assessmentAttempt: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.attempt(a.id);
    },
    assessmentHistory: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.history(
        a.taskId,
        a.page ?? 0,
        a.skill,
        a.status,
        a.title,
      );
    },
    authoringAssessmentTasks: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.authoring(a.skill, a.status, a.page ?? 0);
    },
    assessmentSubmissions: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.submissions(
        a.status,
        a.page ?? 0,
        a.skill,
        a.term,
        a.oldest ?? true,
      );
    },
    assessmentSubmission: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.attempt(a.id, true);
    },
  },
  Mutation: {
    readAssessmentResult: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.readResult(a.id, a.version);
    },
    startAssessment: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.start(
        a.taskId,
        a.clientKey,
        a.contentType,
        a.contentLength,
      );
    },
    saveAssessmentDraft: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.save(a.id, a.answerText, a.version);
    },
    submitAssessment: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.action(a.id, "submit");
    },
    retryAssessment: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.action(a.id, "retry");
    },
    requestAssessmentReview: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.action(a.id, "request-review");
    },
    createAssessmentTask: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.create(a.input);
    },
    editAssessmentTask: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.edit(a.id, a.version, a.input);
    },
    transitionAssessmentTask: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.transition(a.id, a.action, a.note);
    },
    gradeAssessment: (_, a, ctx) => {
      ctx.requireToken();
      return ctx.apis.assessmentApi.grade(
        a.id,
        a.report,
        a.note,
        a.transcript,
        a.version,
      );
    },
  },
} satisfies Resolvers;
