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
    avatarPresets: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.userApi.getAvatarPresets();
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
    chooseAvatar: (_, { preset }, ctx) => {
      ctx.requireToken();
      return ctx.apis.userApi.chooseAvatar(preset);
    },
  },
  UserWall: {
    // Nullable in the schema: a failed profile call nulls only this field and
    // adds an entry to `errors`, so the web can tell a missing account
    // (backendCode USER_NOT_FOUND) from a passing failure. Not caught here on
    // purpose. The friendship module's relationship call has already decided
    // `available`, so nothing is fetched for a blocked wall.
    profile: (wall, _args, ctx) =>
      wall.available ? ctx.apis.userApi.publicProfile(wall.userId) : null,
  },
} satisfies Resolvers;
