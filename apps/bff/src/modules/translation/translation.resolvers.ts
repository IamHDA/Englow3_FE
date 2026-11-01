import type { Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";

export const translationResolvers = {
  Query: {
    translationSets: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.translationApi.searchSets({
        ...args,
        size: clampPageSize(args.size),
      });
    },
    translationSet: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.translationApi.getSet(args.id);
    },
    translationAttempt: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.translationApi.getAttempt(args.id);
    },
    translationAttempts: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.translationApi.getAttempts({
        ...args,
        size: clampPageSize(args.size),
      });
    },
  },
  Mutation: {
    submitTranslation: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.translationApi.submit(args.itemId, args.response);
    },
  },
} satisfies Resolvers;
