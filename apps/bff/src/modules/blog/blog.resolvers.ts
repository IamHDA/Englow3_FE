import type { Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";

const DEFAULT_PAGE_SIZE = 20;
/** BlogRecommendationServiceImpl answers 3 unless asked and never more than 10. */
const DEFAULT_RECOMMENDATIONS = 3;
const MAX_RECOMMENDATIONS = 10;
/** The backend's own cap on every list of this module (BlogPostServiceImpl, BlogCommentServiceImpl, BlogModerationServiceImpl). */
const MAX_PAGE_SIZE = 50;

type PageArgs = { page?: number | null; size?: number | null };

const pageParams = ({ page, size }: PageArgs) => ({
  page: page ?? 0,
  size: clampPageSize(size, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
});

export const blogResolvers = {
  Query: {
    blogPosts: (_, args, ctx) => {
      ctx.requireToken();
      // The filters go as given: which posts a viewer may see, what a search
      // term must hold and which tag values exist are the backend's to decide.
      return ctx.apis.blogApi.list({
        q: args.q,
        skill: args.skill,
        level: args.level,
        certificate: args.certificate,
        authorId: args.authorId,
        sort: args.sort,
        ...pageParams(args),
      });
    },
    blogPost: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.post(id);
    },
    blogComments: (_, { postId, ...paging }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.comments(postId, pageParams(paging));
    },
    blogTagCatalogue: (_, __, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.tagCatalogue();
    },
    blogRecommendations: async (_, { limit }, ctx) => {
      ctx.requireToken();
      const recommendations = await ctx.apis.blogApi.recommendations({
        limit: clampPageSize(
          limit,
          DEFAULT_RECOMMENDATIONS,
          MAX_RECOMMENDATIONS,
        ),
      });
      // The REST answer nests the reason; the screen reads it flat.
      return recommendations.map(({ post, reason }) => ({
        post,
        kind: reason.kind,
        matchedTags: reason.matchedTags,
      }));
    },
    savedBlogPosts: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.savedPosts(pageParams(args));
    },
    adminBlogQueue: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.adminQueue({
        type: args.type,
        sort: args.sort,
        ...pageParams(args),
      });
    },
    adminBlogTarget: (_, { type, id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.adminTarget(type, id);
    },
    adminBlogActions: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.adminActions(pageParams(args));
    },
  },
  Mutation: {
    createBlogPost: (_, { input }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.create(input);
    },
    updateBlogPost: (_, { id, input, version }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.update(id, { ...input, version });
    },
    deleteBlogPost: async (_, { id }, ctx) => {
      ctx.requireToken();
      await ctx.apis.blogApi.remove(id);
      return true;
    },
    likeBlogPost: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.like(id);
    },
    unlikeBlogPost: (_, { id }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.unlike(id);
    },
    saveBlogPost: async (_, { id }, ctx) => {
      ctx.requireToken();
      const { saved } = await ctx.apis.blogApi.save(id);
      // The REST answer is the state alone; naming the post lets the client
      // tell which post it is about without keeping the argument around.
      return { postId: id, saved };
    },
    unsaveBlogPost: async (_, { id }, ctx) => {
      ctx.requireToken();
      const { saved } = await ctx.apis.blogApi.unsave(id);
      return { postId: id, saved };
    },
    createBlogComment: (_, { postId, body }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.createComment(postId, { body });
    },
    updateBlogComment: (_, { id, body }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.updateComment(id, { body });
    },
    deleteBlogComment: async (_, { id }, ctx) => {
      ctx.requireToken();
      await ctx.apis.blogApi.removeComment(id);
      return true;
    },
    startBlogImageUpload: (_, { contentType, contentLength }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.startImageUpload({ contentType, contentLength });
    },
    reportBlogPost: (_, { id, reason, detail }, ctx) => {
      ctx.requireToken();
      // GraphQL's null is "no note" here; the REST body leaves the key out.
      return ctx.apis.blogApi.reportPost(id, {
        reason,
        detail: detail ?? undefined,
      });
    },
    reportBlogComment: (_, { id, reason, detail }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.reportComment(id, {
        reason,
        detail: detail ?? undefined,
      });
    },
    adminModerateBlog: (_, { type, id, action, reason }, ctx) => {
      ctx.requireToken();
      return ctx.apis.blogApi.adminModerate(type, id, { action, reason });
    },
  },
  UserWall: {
    // Nullable on purpose: a failure here nulls only this field (graphql-js),
    // the rest of the wall still renders. Nothing is asked for a wall that is
    // unavailable - the friendship module's relationship call has already
    // decided that, and the backend would leave out a blocked person's posts
    // anyway. Which posts the viewer may see (their own wall also holds their
    // hidden and removed ones) is the backend's, decided from authorId.
    posts: (wall, args, ctx) =>
      wall.available
        ? ctx.apis.blogApi.list({
            authorId: wall.userId,
            sort: "NEWEST",
            ...pageParams(args),
          })
        : null,
  },
} satisfies Resolvers;
