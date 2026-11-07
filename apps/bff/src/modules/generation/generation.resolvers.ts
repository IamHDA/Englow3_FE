import type { Resolvers } from "../../generated/graphql.js";

export const generationResolvers = {
  Query: {
    generationRequests: (_, { page, size }, ctx) => {
      ctx.requireToken();
      return ctx.apis.generationApi.list(page ?? 0, size ?? 20);
    },
    generationRequest: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.generationApi.detail(id);
    },
    generationAllowance: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.generationApi.allowance();
    },
  },
  Mutation: {
    requestGeneration: (_, { kind, brief }, ctx) => {
      ctx.requireToken();
      const trimmed = brief?.trim();
      return ctx.apis.generationApi.request({
        kind,
        brief: trimmed ? trimmed : undefined,
      });
    },
  },
} satisfies Resolvers;
