import { dateScalar } from "./scalars.js";
import { onboardingResolvers } from "../modules/onboarding/onboarding.resolvers.js";
import { onboardingTypeDefs } from "../modules/onboarding/onboarding.typeDefs.js";
import { userResolvers } from "../modules/user/user.resolvers.js";
import { userTypeDefs } from "../modules/user/user.typeDefs.js";

const rootTypeDefs = `#graphql
  scalar Date

  type Query {
    health: String!
  }
`;

export const typeDefs = [rootTypeDefs, userTypeDefs, onboardingTypeDefs];

export const resolvers = {
  Date: dateScalar,
  Query: {
    health: () => "ok",
    ...userResolvers.Query,
    ...onboardingResolvers.Query,
  },
  Me: {
    ...onboardingResolvers.Me,
  },
};
