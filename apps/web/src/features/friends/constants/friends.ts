/**
 * The lists of /friends, in the order the side menu shows them. "requests" is
 * the ones the viewer received, "sent" the ones the viewer sent. Their labels
 * are copy: `t.friends.sections`.
 */
export const FRIENDS_SECTIONS = [
  "friends",
  "requests",
  "sent",
  "blocked",
] as const;

export type FriendsSection = (typeof FRIENDS_SECTIONS)[number];

export const DEFAULT_FRIENDS_SECTION: FriendsSection = "friends";

/** The address parameters of /friends: `?tab=<section>&q=<what is searched for>`. */
export const FRIENDS_ADDRESS_PARAMS = {
  section: "tab",
  query: "q",
} as const;

/**
 * Links from before the search box moved into the side column asked for
 * `?tab=search`. It is still understood: the default list, with the box focused.
 */
export const LEGACY_SEARCH_TAB = "search";

/** Which friend requests a list shows: the ones the viewer received, or the ones the viewer sent. */
export type RequestDirection = "incoming" | "outgoing";

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
  /** /friends opened on what a search for this term finds. */
  searchFor: (term: string) =>
    `/friends?${FRIENDS_ADDRESS_PARAMS.query}=${encodeURIComponent(term)}`,
  profile: "/profile",
  admin: "/admin",
  home: "/",
  wall: (userId: string) => `/people/${encodeURIComponent(userId)}`,
} as const;
