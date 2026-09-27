import type { Resolvers } from "../../generated/graphql.js";

export const userResolvers = {
  Query: {
    me: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.userApi.getMe();
    },
  },
  Mutation: {
    updateProfile: (_, { input }, ctx) => {
      ctx.requireToken();
      return ctx.apis.userApi.updateProfile(input);
    },
  },
} satisfies Resolvers;
