import type { Resolvers } from "../../generated/graphql.js";

/** The backend trusts the requested size; the cap belongs here so a client cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100;

export const contentManagementResolvers = {
  Query: {
    adminOverview: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.getAdminOverview();
    },
    adminContent: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.searchContentForAuthoring({
        ...args,
        size: Math.min(args.size ?? 20, MAX_PAGE_SIZE),
      });
    },
  },
  Mutation: {
    submitContentForReview: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.submitContentForReview(
        args.kind,
        args.id,
      );
    },
    approveContent: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.approveContent(args.kind, args.id);
    },
    // The note is forwarded as it stands. Trimming or defaulting it here would
    // hide a blank one from the backend check, which is where the rule that a
    // rejection must say why actually lives.
    rejectContent: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.rejectContent(
        args.kind,
        args.id,
        args.note,
      );
    },
    publishContent: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.publishContent(args.kind, args.id);
    },
    archiveContent: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.contentManagementApi.archiveContent(args.kind, args.id);
    },
  },
} satisfies Resolvers;
