import type { GraphQLContext } from "../../graphql/context.js";
import type { UpdateProfileInput } from "./user.types.js";

export const userResolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.userApi.getMe();
    },
  },
  Mutation: {
    updateProfile: (
      _: unknown,
      { input }: { input: UpdateProfileInput },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.userApi.updateProfile(input);
    },
  },
};
