/** The tabs of /friends, in the order they are shown. Their labels are copy: `t.friends.tabs`. */
export const FRIENDS_TABS = [
  "friends",
  "requests",
  "search",
  "blocked",
] as const;

export type FriendsTab = (typeof FRIENDS_TABS)[number];

export const DEFAULT_FRIENDS_TAB: FriendsTab = "friends";

/** Which requests the "requests" tab lists. Labels: `t.friends.directions`. */
export const REQUEST_DIRECTIONS = ["incoming", "outgoing"] as const;

export type RequestDirection = (typeof REQUEST_DIRECTIONS)[number];

/** How many rows a list shows per page. The backend allows up to 50. */
export const FRIENDS_PAGE_SIZE = 20;

/** The backend's own cap on a page, used when scanning every page of the sent requests. */
export const FRIENDS_MAX_PAGE_SIZE = 50;

/** Shortest search the backend answers - it refuses anything shorter with SEARCH_TERM_TOO_SHORT. */
export const MIN_SEARCH_TERM_LENGTH = 2;

export const SEARCH_DEBOUNCE_MS = 300;

/** How often the header asks again how many requests are waiting. */
export const REQUEST_COUNT_POLL_MS = 60_000;

/** Beyond this the header badge says "99+". */
export const REQUEST_BADGE_MAX = 99;

/**
 * Names of the queries that show who stands where with whom: every one is
 * refreshed after a friendship change. They are the operation names in
 * graphql/*.graphql.
 */
export const AFFECTED_QUERY_NAMES: ReadonlySet<string> = new Set([
  "Relationship",
  "UserWall",
  "Friends",
  "IncomingFriendRequests",
  "OutgoingFriendRequests",
  "IncomingFriendRequestCount",
  "BlockedUsers",
  "SearchLearners",
]);

/** Backend codes the screens branch on. */
export const BACKEND_CODES = {
  userNotFound: "USER_NOT_FOUND",
  friendRequestNotFound: "FRIEND_REQUEST_NOT_FOUND",
} as const;

export const FRIENDS_ROUTES = {
  friends: "/friends",
  requests: "/friends?tab=requests",
  search: "/friends?tab=search",
  profile: "/profile",
  admin: "/admin",
  home: "/",
  wall: (userId: string) => `/people/${encodeURIComponent(userId)}`,
} as const;
