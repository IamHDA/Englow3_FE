import type { Resolvers } from "../../generated/graphql.js";

export const onboardingResolvers = {
  Query: {
    learningPurposes: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.getLearningPurposes();
    },
  },
  Mutation: {
    selectLearningPurposes: (_, { purposeIds }, ctx) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.selectLearningPurposes({ purposeIds });
    },
    setCertificateTarget: (_, { certificateType }, ctx) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.setCertificateTarget({ certificateType });
    },
    setCurrentLevel: (_, { level }, ctx) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.setCurrentLevel({ level });
    },
    setLearningGoal: (_, { input }, ctx) => {
      ctx.requireToken();
      // GraphQL lets a client send an explicit null for these; the REST body
      // only has a word for "omitted" - same result once JSON.stringify drops
      // an undefined property, so this is a type-level translation only.
      return ctx.apis.onboardingApi.setLearningGoal({
        ...input,
        targetScore: input.targetScore ?? undefined,
        targetDate: input.targetDate ?? undefined,
      });
    },
    selectTargetSkills: (_, { skills }, ctx) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.selectTargetSkills({ skills });
    },
    completeOnboarding: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.complete();
    },
  },
  Me: {
    // Nullable in the schema: if this call fails, graphql-js resolves the
    // field to null and adds an entry to the `errors` array rather than
    // failing the whole `me` query - the rest of Me still renders.
    onboardingState: (_parent, __, ctx) =>
      ctx.apis.onboardingApi.getCurrentState(),
  },
} satisfies Resolvers;
