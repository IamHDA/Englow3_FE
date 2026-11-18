import type {
  BlockedUsersQuery,
  FriendsQuery,
  IncomingFriendRequestsQuery,
  SearchLearnersQuery,
  UserWallQuery,
} from "@/lib/graphql/generated";

export type FriendItem = FriendsQuery["friends"]["items"][number];
export type FriendRequestItem =
  IncomingFriendRequestsQuery["incomingFriendRequests"]["items"][number];
export type LearnerSearchItem =
  SearchLearnersQuery["searchLearners"]["items"][number];
export type BlockedUserItem =
  BlockedUsersQuery["blockedUsers"]["items"][number];
export type WallProfile = NonNullable<UserWallQuery["userWall"]["profile"]>;

/**
 * What a button on someone's row or wall can ask for. Seven wishes, six
 * mutations: declining a request someone sent and cancelling one you sent are
 * both a withdrawal on the backend, but they say different things to the person.
 */
export type RelationshipActionKind =
  "send" | "accept" | "decline" | "cancel" | "unfriend" | "block" | "unblock";

/** The kinds that ask "are you sure?" first: the ones that take something away. */
export type ConfirmableActionKind = Extract<
  RelationshipActionKind,
  "unfriend" | "block"
>;

/** What the person has been asked to confirm, and about whom. */
export type RelationshipConfirmation = {
  kind: ConfirmableActionKind;
  target: RelationshipTarget;
};

/** Who an action is about, as much as the screen that shows them knows. */
export type RelationshipTarget = {
  userId: string;
  displayName: string;
  /**
   * The request to answer. The backend gives it only for a request the viewer
   * received (relationships, search) - for one the viewer sent it is absent
   * outside the "sent" list, and cancelling then looks it up.
   */
  requestId?: string | null;
};

/** The action in flight, and whose it is: only that person's buttons spin. */
export type PendingRelationshipAction = {
  kind: RelationshipActionKind;
  userId: string;
};

export type RelationshipActionHandler = (
  kind: RelationshipActionKind,
  target: RelationshipTarget,
) => void;
