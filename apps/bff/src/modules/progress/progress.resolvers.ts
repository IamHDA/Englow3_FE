import type { Resolvers } from "../../generated/graphql.js";

export const progressResolvers = {
  Query: {
    dailyPath: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.progressApi.getDailyPath();
    },
  },
} satisfies Resolvers;
