import { dateScalar, dateTimeScalar } from "./scalars.js";
import { contentManagementResolvers } from "../modules/contentManagement/contentManagement.resolvers.js";
import { contentManagementTypeDefs } from "../modules/contentManagement/contentManagement.typeDefs.js";
import { dictationResolvers } from "../modules/dictation/dictation.resolvers.js";
import { dictationTypeDefs } from "../modules/dictation/dictation.typeDefs.js";
import { examResolvers } from "../modules/exam/exam.resolvers.js";
import { examTypeDefs } from "../modules/exam/exam.typeDefs.js";
import { flashcardResolvers } from "../modules/flashcard/flashcard.resolvers.js";
import { flashcardTypeDefs } from "../modules/flashcard/flashcard.typeDefs.js";
import { progressResolvers } from "../modules/progress/progress.resolvers.js";
import { progressTypeDefs } from "../modules/progress/progress.typeDefs.js";
import { quizResolvers } from "../modules/quiz/quiz.resolvers.js";
import { quizTypeDefs } from "../modules/quiz/quiz.typeDefs.js";
import { speakingResolvers } from "../modules/speaking/speaking.resolvers.js";
import { speakingTypeDefs } from "../modules/speaking/speaking.typeDefs.js";
import { tutorResolvers } from "../modules/tutor/tutor.resolvers.js";
import { tutorTypeDefs } from "../modules/tutor/tutor.typeDefs.js";
import { onboardingResolvers } from "../modules/onboarding/onboarding.resolvers.js";
import { onboardingTypeDefs } from "../modules/onboarding/onboarding.typeDefs.js";
import { userResolvers } from "../modules/user/user.resolvers.js";
import { userTypeDefs } from "../modules/user/user.typeDefs.js";

const rootTypeDefs = `#graphql
  scalar Date
  scalar DateTime

  type Query {
    health: String!
  }

  type Mutation {
    _empty: Boolean
  }
`;

export const typeDefs = [
  rootTypeDefs,
  userTypeDefs,
  onboardingTypeDefs,
  examTypeDefs,
  flashcardTypeDefs,
  quizTypeDefs,
  dictationTypeDefs,
  progressTypeDefs,
  contentManagementTypeDefs,
  speakingTypeDefs,
  tutorTypeDefs,
];

export const resolvers = {
  Date: dateScalar,
  DateTime: dateTimeScalar,
  Query: {
    health: () => "ok",
    ...userResolvers.Query,
    ...onboardingResolvers.Query,
    ...examResolvers.Query,
    ...flashcardResolvers.Query,
    ...quizResolvers.Query,
    ...dictationResolvers.Query,
    ...progressResolvers.Query,
    ...contentManagementResolvers.Query,
    ...speakingResolvers.Query,
    ...tutorResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...onboardingResolvers.Mutation,
    ...examResolvers.Mutation,
    ...flashcardResolvers.Mutation,
    ...quizResolvers.Mutation,
    ...dictationResolvers.Mutation,
    ...contentManagementResolvers.Mutation,
    ...speakingResolvers.Mutation,
    ...tutorResolvers.Mutation,
  },
  Me: {
    ...onboardingResolvers.Me,
  },
};
