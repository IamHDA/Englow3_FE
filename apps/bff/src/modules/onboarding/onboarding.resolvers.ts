import type { Resolvers } from "../../generated/graphql.js";
import type { OnboardingStateResponse } from "./onboarding.types.js";

/**
 * The backend leaves the collection fields null before the learner has touched
 * them; the schema promises lists.
 */
function toOnboardingState(state: OnboardingStateResponse) {
  return {
    step: state.step,
    learningPurposeIds: state.learningPurposeIds ?? [],
    certificateLearner: state.certificateLearner,
    targetCertificateType: state.targetCertificateType,
    currentLevel: state.currentLevel,
    targetScore: state.targetScore,
    targetDate: state.targetDate,
    targetSkills: state.targetSkills ?? [],
  };
}

export const onboardingResolvers = {
  Query: {
    learningPurposes: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.getLearningPurposes();
    },
  },
  Mutation: {
    selectLearningPurposes: async (_, { purposeIds }, ctx) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.selectLearningPurposes({ purposeIds }),
      );
    },
    setCertificateTarget: async (_, { certificateType }, ctx) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.setCertificateTarget({ certificateType }),
      );
    },
    setCurrentLevel: async (_, { level }, ctx) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.setCurrentLevel({ level }),
      );
    },
    setLearningGoal: async (_, { input }, ctx) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.setLearningGoal(input),
      );
    },
    selectTargetSkills: async (_, { skills }, ctx) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.selectTargetSkills({ skills }),
      );
    },
    completeOnboarding: async (_, __, ctx) => {
      ctx.requireToken();
      return toOnboardingState(await ctx.apis.onboardingApi.complete());
    },
  },
  Me: {
    // Nullable in the schema: if this call fails, graphql-js resolves the
    // field to null and adds an entry to the `errors` array rather than
    // failing the whole `me` query - the rest of Me still renders.
    onboardingState: async (_parent, __, ctx) =>
      toOnboardingState(await ctx.apis.onboardingApi.getCurrentState()),
  },
} satisfies Resolvers;
