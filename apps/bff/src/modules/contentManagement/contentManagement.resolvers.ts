import type { GraphQLContext } from "../../graphql/context.js";
import type {
  ContentKind,
  SearchContentParams,
} from "./contentManagement.types.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const contentManagementResolvers = {
  Query: {
    adminOverview: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.getAdminOverview();
    },
    adminContent: (
      _: unknown,
      args: SearchContentParams,
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.searchContentForAuthoring({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
  },
  Mutation: {
    submitContentForReview: (
      _: unknown,
      args: { kind: ContentKind; id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.submitContentForReview(
        args.kind,
        args.id,
      );
    },
    approveContent: (
      _: unknown,
      args: { kind: ContentKind; id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.approveContent(args.kind, args.id);
    },
    // The note is forwarded as it stands. Trimming or defaulting it here would
    // hide a blank one from the backend check, which is where the rule that a
    // rejection must say why actually lives.
    rejectContent: (
      _: unknown,
      args: { kind: ContentKind; id: string; note: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.rejectContent(
        args.kind,
        args.id,
        args.note,
      );
    },
    publishContent: (
      _: unknown,
      args: { kind: ContentKind; id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.publishContent(args.kind, args.id);
    },
    archiveContent: (
      _: unknown,
      args: { kind: ContentKind; id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.archiveContent(args.kind, args.id);
    },
  },
};
