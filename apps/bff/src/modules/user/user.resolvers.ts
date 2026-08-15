import type { GraphQLContext } from "../../graphql/context.js";

export const userResolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.userApi.getMe();
    },
  },
};
