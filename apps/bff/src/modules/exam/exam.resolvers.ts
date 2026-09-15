import type { GraphQLContext } from "../../graphql/context.js";
import type {
  SearchExamsParams,
  SearchLearnerExamsParams,
} from "./exam.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const examResolvers = {
  Query: {
    exams: async (
      _: unknown,
      args: SearchLearnerExamsParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      const page = await ctx.apis.examApi.searchAsLearner({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });

      return {
        ...page,
        items: page.items.map((item) => ({
          ...item,
          bestScore: null,
          attemptStatus: "NOT_STARTED",
        })),
      };
    },
    adminExams: (_: unknown, args: SearchExamsParams, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.searchAsAdmin({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
    exam: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.getByIdAsLearner(args.id);
    },
    examPaper: (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.examApi.getPaperAsLearner(args.id);
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
