import type { RelationshipStatus, Resolvers } from "../../generated/graphql.js";
import { clampPageSize } from "../../shared/graphql/pagination.js";
import { toRelationship } from "./friendship.mapper.js";

const DEFAULT_PAGE_SIZE = 20;
/** The backend's own cap on these lists (FriendshipController, BlockController). */
const MAX_PAGE_SIZE = 50;

/**
 * The wall is shown as unavailable when either side blocked the other. The
 * backend reports the viewer's own block as BLOCKED_BY_ME and the other side's
 * as UNAVAILABLE, and never says which direction the second one came from.
 */
const UNAVAILABLE_STATES: ReadonlySet<RelationshipStatus> = new Set([
  "UNAVAILABLE",
  "BLOCKED_BY_ME",
]);

/** Staff (or an id that names no account) has a wall but no friends to count. */
const NO_FRIEND_COUNT_STATE: RelationshipStatus = "NOT_APPLICABLE";

type PageArgs = { page?: number | null; size?: number | null };

const pageParams = ({ page, size }: PageArgs) => ({
  page: page ?? 0,
  size: clampPageSize(size, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
});

export const friendshipResolvers = {
  Query: {
    friends: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.friendshipApi.friends(pageParams(args));
    },
    incomingFriendRequests: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.friendshipApi.incoming(pageParams(args));
    },
    outgoingFriendRequests: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.friendshipApi.outgoing(pageParams(args));
    },
    incomingFriendRequestCount: async (_, __, ctx) => {
      ctx.requireToken();
      return (await ctx.apis.friendshipApi.incomingCount()).count;
    },
    searchLearners: (_, args, ctx) => {
      ctx.requireToken();
      // `q` goes as typed: the backend trims it and owns the minimum length.
      return ctx.apis.friendshipApi.search({ q: args.q, ...pageParams(args) });
    },
    blockedUsers: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.friendshipApi.blocked(pageParams(args));
    },
    relationship: async (_, { userId }, ctx) => {
      ctx.requireToken();
      return toRelationship(await ctx.apis.friendshipApi.relationship(userId));
    },
    // The block rule of the wall lives here: one relationship call decides
    // whether anything else is fetched. UserWall.friendCount and
    // UserWall.profile (user module) then run in parallel and only when the
    // wall is available.
    userWall: async (_, { userId }, ctx) => {
      ctx.requireToken();
      // REST `relationship` -> `status` happens inside toRelationship.
      const relationship = toRelationship(
        await ctx.apis.friendshipApi.relationship(userId),
      );
      return {
        userId,
        available: !UNAVAILABLE_STATES.has(relationship.status),
        relationship,
      };
    },
  },
  Mutation: {
    sendFriendRequest: (_, { addresseeId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.friendshipApi.send(addresseeId);
    },
    acceptFriendRequest: (_, { requestId }, ctx) => {
      ctx.requireToken();
      return ctx.apis.friendshipApi.accept(requestId);
    },
    withdrawFriendRequest: async (_, { requestId }, ctx) => {
      ctx.requireToken();
      await ctx.apis.friendshipApi.withdraw(requestId);
      return true;
    },
    unfriend: async (_, { userId }, ctx) => {
      ctx.requireToken();
      await ctx.apis.friendshipApi.unfriend(userId);
      return true;
    },
    blockUser: async (_, { userId }, ctx) => {
      ctx.requireToken();
      await ctx.apis.friendshipApi.block(userId);
      return true;
    },
    unblockUser: async (_, { userId }, ctx) => {
      ctx.requireToken();
      await ctx.apis.friendshipApi.unblock(userId);
      return true;
    },
  },
  UserWall: {
    // Nullable on purpose: a failure here nulls only this field (graphql-js),
    // the wall still renders.
    friendCount: (wall, _args, ctx) =>
      !wall.available || wall.relationship.status === NO_FRIEND_COUNT_STATE
        ? null
        : ctx.apis.friendshipApi.friendCount(wall.userId).then((r) => r.count),
  },
} satisfies Resolvers;
