export const friendshipTypeDefs = /* GraphQL */ `
  """
  How the viewer stands with one account. Only NONE offers "add friend"; the
  last three offer nothing. UNAVAILABLE is the other side having blocked the
  viewer - it never says why, so a block is not revealed to the person it was
  placed on.
  """
  enum RelationshipStatus {
    NONE
    FRIENDS
    REQUEST_SENT
    REQUEST_RECEIVED
    BLOCKED_BY_ME
    UNAVAILABLE
    SELF
    NOT_APPLICABLE
  }

  enum FriendRequestStatus {
    PENDING
    ACCEPTED
  }

  type Friend {
    userId: ID!
    displayName: String!
    avatarUrl: String
    friendsSince: DateTime!
  }

  type FriendPage {
    items: [Friend!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type FriendRequest {
    requestId: ID!
    userId: ID!
    displayName: String!
    avatarUrl: String
    requestedAt: DateTime!
  }

  type FriendRequestPage {
    items: [FriendRequest!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type BlockedUser {
    userId: ID!
    displayName: String!
    avatarUrl: String
    blockedAt: DateTime!
  }

  type BlockedUserPage {
    items: [BlockedUser!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type LearnerSearchResult {
    userId: ID!
    displayName: String!
    avatarUrl: String
    relationship: RelationshipStatus!
    """
    Set only when the learner has asked the viewer (REQUEST_RECEIVED): the
    id to accept or decline.
    """
    requestId: ID
  }

  type LearnerSearchPage {
    items: [LearnerSearchResult!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type Relationship {
    userId: ID!
    status: RelationshipStatus!
    """
    Set only for REQUEST_RECEIVED: the id to accept or decline.
    """
    requestId: ID
  }

  type FriendRequestOutcome {
    requestId: ID!
    userId: ID!
    status: FriendRequestStatus!
    requestedAt: DateTime!
    acceptedAt: DateTime
  }

  """
  The wall of one account: composed from user, friendship and (later) blog.
  """
  type UserWall {
    userId: ID!
    """
    False when either side blocked the other. userId and relationship stay set
    (BLOCKED_BY_ME is what offers the viewer "unblock"); friendCount and profile
    are then null, and nothing else is fetched.
    """
    available: Boolean!
    relationship: Relationship!
    """
    Null for staff and when unavailable.
    """
    friendCount: Int
  }

  extend type Query {
    friends(page: Int, size: Int): FriendPage!
    incomingFriendRequests(page: Int, size: Int): FriendRequestPage!
    outgoingFriendRequests(page: Int, size: Int): FriendRequestPage!
    incomingFriendRequestCount: Int!
    """
    Learners by display name. Refused with extensions.backendCode
    SEARCH_TERM_TOO_SHORT below the backend's minimum length.
    """
    searchLearners(q: String!, page: Int, size: Int): LearnerSearchPage!
    blockedUsers(page: Int, size: Int): BlockedUserPage!
    relationship(userId: ID!): Relationship!
    userWall(userId: ID!): UserWall!
  }

  extend type Mutation {
    sendFriendRequest(addresseeId: ID!): FriendRequestOutcome!
    acceptFriendRequest(requestId: ID!): FriendRequestOutcome!
    """
    Declines a request sent to the viewer, or cancels one the viewer sent.
    """
    withdrawFriendRequest(requestId: ID!): Boolean!
    unfriend(userId: ID!): Boolean!
    blockUser(userId: ID!): Boolean!
    unblockUser(userId: ID!): Boolean!
  }
`;
