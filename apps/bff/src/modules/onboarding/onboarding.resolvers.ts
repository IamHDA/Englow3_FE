import type { GraphQLContext } from "../../graphql/context.js";
import type { UserInformationResponse } from "../user/user.types.js";
import type {
  CefrLevel,
  LearningSkill,
  OnboardingStateResponse,
  SetLearningGoalRequest,
  TargetCertificate,
} from "./onboarding.types.js";

/**
 * The backend leaves the collection fields null before the learner has touched
 * them; the schema promises lists. `step` is dropped here on purpose -
 * Me.onboardingStep is the one place the step is read from.
 */
function toOnboardingState(state: OnboardingStateResponse) {
  return {
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
    learningPurposes: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.onboardingApi.getLearningPurposes();
    },
  },
  Mutation: {
    selectLearningPurposes: async (
      _: unknown,
      { purposeIds }: { purposeIds: number[] },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.selectLearningPurposes({ purposeIds }),
      );
    },
    setCertificateTarget: async (
      _: unknown,
      { certificateType }: { certificateType: TargetCertificate },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.setCertificateTarget({ certificateType }),
      );
    },
    setCurrentLevel: async (
      _: unknown,
      { level }: { level: CefrLevel },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.setCurrentLevel({ level }),
      );
    },
    setLearningGoal: async (
      _: unknown,
      { input }: { input: SetLearningGoalRequest },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.setLearningGoal(input),
      );
    },
    selectTargetSkills: async (
      _: unknown,
      { skills }: { skills: LearningSkill[] },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return toOnboardingState(
        await ctx.apis.onboardingApi.selectTargetSkills({ skills }),
      );
    },
    completeOnboarding: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return toOnboardingState(await ctx.apis.onboardingApi.complete());
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
    ) => toOnboardingState(await ctx.apis.onboardingApi.getCurrentState()),
  },
};
