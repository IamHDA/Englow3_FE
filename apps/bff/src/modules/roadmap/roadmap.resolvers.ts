import type { Resolvers } from "../../generated/graphql.js";

export const roadmapResolvers = {
  Query: {
    roadmap: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.getRoadmap();
    },
    latestLevelCheck: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.getLatestLevelCheck();
    },
    levelCheck: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.getLevelCheck(id);
    },
  },
  Mutation: {
    createRoadmap: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.createRoadmap();
    },
    abandonRoadmap: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.abandonRoadmap();
    },
    recordMilestoneSitting: (_, { milestoneId, examAttemptId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.recordMilestoneSitting(
        milestoneId,
        examAttemptId,
      );
    },
    startLevelCheck: (_, { purpose, milestoneId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.startLevelCheck({
        purpose,
        milestoneId: milestoneId ?? undefined,
      });
    },
    attachLevelCheckExamAttempt: (_, { id, attemptId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.attachExamAttempt(id, attemptId);
    },
    attachLevelCheckSpeakingAttempt: (_, { id, attemptId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.attachSpeakingAttempt(id, attemptId);
    },
    skipLevelCheckSpeaking: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.roadmapApi.skipSpeaking(id);
    },
  },
} satisfies Resolvers;
