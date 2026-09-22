import { dateScalar, dateTimeScalar } from "./scalars.js";
import { examResolvers } from "../modules/exam/exam.resolvers.js";
import { examTypeDefs } from "../modules/exam/exam.typeDefs.js";
import { learningResolvers } from "../modules/learning/learning.resolvers.js";
import { learningTypeDefs } from "../modules/learning/learning.typeDefs.js";
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
  learningTypeDefs,
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
    ...learningResolvers.Query,
    ...speakingResolvers.Query,
    ...tutorResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...onboardingResolvers.Mutation,
    ...examResolvers.Mutation,
    ...learningResolvers.Mutation,
    ...speakingResolvers.Mutation,
    ...tutorResolvers.Mutation,
  },
  Me: {
    ...onboardingResolvers.Me,
  },
};
