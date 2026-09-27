import type { GraphQLContext } from "../../graphql/context.js";

export const progressResolvers = {
  Query: {
    dailyPath: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.progressApi.getDailyPath();
    },
  },
};
