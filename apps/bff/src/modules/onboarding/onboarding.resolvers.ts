import type { GraphQLContext } from "../../graphql/context.js";
import type { UserInformationResponse } from "../user/user.types.js";

export const onboardingResolvers = {
  Query: {
    learningPurposes: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.getLearningPurposes();
    },
  },
  Me: {
    // Nullable in the schema: if this call fails, graphql-js resolves the
    // field to null and adds an entry to the `errors` array rather than
    // failing the whole `me` query - the rest of Me still renders.
    onboardingState: async (
      _parent: UserInformationResponse,
      __: unknown,
      ctx: GraphQLContext,
    ) => {
      const state = await ctx.apis.onboardingApi.getCurrentState();
      return {
        learningPurposeIds: state.learningPurposeIds ?? [],
        certificateLearner: state.certificateLearner,
        targetCertificateType: state.targetCertificateType,
        currentLevel: state.currentLevel,
        targetScore: state.targetScore,
        targetDate: state.targetDate,
        targetSkills: state.targetSkills ?? [],
      };
    },
  },
};
