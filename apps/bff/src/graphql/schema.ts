import { dateScalar, dateTimeScalar } from "./scalars.js";
import { examResolvers } from "../modules/exam/exam.resolvers.js";
import { examTypeDefs } from "../modules/exam/exam.typeDefs.js";
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
];

export const resolvers = {
  Date: dateScalar,
  DateTime: dateTimeScalar,
  Query: {
    health: () => "ok",
    ...userResolvers.Query,
    ...onboardingResolvers.Query,
    ...examResolvers.Query,
  },
  Mutation: {
    ...examResolvers.Mutation,
  },
  Me: {
    ...onboardingResolvers.Me,
  },
};
