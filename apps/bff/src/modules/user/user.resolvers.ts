import type { Resolvers } from "../../generated/graphql.js";

export const userResolvers = {
  Query: {
    me: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.userApi.getMe();
    },
    myTourStatus: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.userApi.getTourStatus();
    },
  },
  Mutation: {
    updateProfile: (_, { input }, ctx) => {
      ctx.requireToken();
      return ctx.apis.userApi.updateProfile(input);
    },
    completeMyTour: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.userApi.completeTour();
    },
  },
} satisfies Resolvers;
