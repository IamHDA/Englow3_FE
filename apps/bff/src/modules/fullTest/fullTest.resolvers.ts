import type { Resolvers } from "../../generated/graphql.js";

export const fullTestResolvers = {
  Query: {
    fullTests: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.catalogue();
    },
    myFullTestSittings: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.mySittings();
    },
    fullTestSitting: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.sitting(id);
    },
    adminFullTests: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.adminList();
    },
    adminFullTest: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.adminDetail(id);
    },
  },
  Mutation: {
    startFullTest: (_, { fullTestId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.start(fullTestId);
    },
    saveFullTest: (_, { id, input }, ctx) => {
      ctx.requireToken();
      const request = {
        ...input,
        description: input.description ?? undefined,
      };
      return id
        ? ctx.apis.fullTestApi.update(id, request)
        : ctx.apis.fullTestApi.create(request);
    },
    submitFullTestForReview: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.submitForReview(id);
    },
    approveFullTest: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.approve(id);
    },
    // Forwarded as it stands: the backend owns the rule that a rejection says why.
    rejectFullTest: (_, { id, note }, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.reject(id, note);
    },
    archiveFullTest: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.fullTestApi.archive(id);
    },
  },
} satisfies Resolvers;
