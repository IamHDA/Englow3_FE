import type { GraphQLContext } from "../../graphql/context.js";
import type { SearchExamsParams } from "./exam.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const examResolvers = {
  Query: {
    adminExams: (_: unknown, args: SearchExamsParams, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.searchAsAdmin({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
  },
  Mutation: {
    publishExam: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.publishAsAdmin(args.id);
    },
    archiveExam: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.archiveAsAdmin(args.id);
    },
  },
};
