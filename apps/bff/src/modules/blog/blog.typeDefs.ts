export const blogTypeDefs = /* GraphQL */ `
  """
  The three kinds of tag a post can carry. Their values (WRITING, B2, IELTS...)
  are plain strings here, listed by blogTagCatalogue: the backend owns them, and
  a copy of its enums in this schema would be one more place to keep in step.
  """
  enum BlogTagKind {
    SKILL
    LEVEL
    CERTIFICATE
  }

  enum BlogPostSort {
    NEWEST
    MOST_LIKED
  }

  """
  PUBLISHED for everyone. HIDDEN (reversible) and REMOVED (permanent) are
  moderation's, and only the author sees a post in either - on their own wall,
  and by its link.
  """
  enum BlogPostStatus {
    PUBLISHED
    HIDDEN
    REMOVED
  }

  """
  VISIBLE for everyone. A comment the viewer wrote that moderation hid or
  removed is still listed for them, with the status; nobody else sees it.
  """
  enum BlogCommentStatus {
    VISIBLE
    HIDDEN
    REMOVED
  }

  enum BlogReportReason {
    SPAM
    HARASSMENT
    INAPPROPRIATE
    MISINFORMATION
    OTHER
  }

  enum BlogReportStatus {
    OPEN
    RESOLVED
    DISMISSED
  }

  enum BlogTargetType {
    POST
    COMMENT
  }

  """
  The status of reported content, as moderation sees it: a post's, or a
  comment's, or DELETED once its author deleted it (then the content and the
  author are gone and only the reports and the history remain).
  """
  enum BlogTargetStatus {
    PUBLISHED
    VISIBLE
    HIDDEN
    REMOVED
    DELETED
  }

  """
  Why a post is recommended. PROFILE: it fits what the viewer declared (see
  matchedTags). POPULAR_THIS_WEEK: fewer posts fit than were asked for, or the
  viewer declared nothing (Staff and Admin), so it is what readers liked in the
  last week. LATEST: what is still missing after that, the newest posts.
  """
  enum BlogRecommendationKind {
    PROFILE
    POPULAR_THIS_WEEK
    LATEST
  }

  enum BlogQueueSort {
    OLDEST
    MOST_REPORTED
  }

  """
  What a moderator does to content. DISMISS closes its open reports and leaves
  it as it is.
  """
  enum BlogModerationAction {
    HIDE
    RESTORE
    REMOVE
    DISMISS
  }

  """
  Null wherever an author appears means the account was erased: the content
  stays, as by a deleted user.
  """
  type BlogAuthor {
    userId: ID!
    displayName: String!
    avatarUrl: String
  }

  type BlogTag {
    kind: BlogTagKind!
    value: String!
  }

  """
  The words a post may be tagged with, one list for each kind.
  """
  type BlogTagCatalogue {
    skills: [String!]!
    levels: [String!]!
    certificates: [String!]!
  }

  """
  An image of a post: the Markdown names it blog-image:<id>, and url is a link
  that expires (a few hours) to show it from.
  """
  type BlogImage {
    id: ID!
    url: String!
  }

  """
  One post in a list: an excerpt, no body.
  """
  type BlogPostSummary {
    id: ID!
    title: String!
    excerpt: String!
    author: BlogAuthor
    """
    PUBLISHED, except when an author lists their own posts: then hidden and
    removed ones are in the list, marked.
    """
    status: BlogPostStatus!
    tags: [BlogTag!]!
    likeCount: Int!
    commentCount: Int!
    likedByMe: Boolean!
    """
    Whether the viewer saved it. A saved post is the viewer's alone to see.
    """
    savedByMe: Boolean!
    createdAt: DateTime!
    editedAt: DateTime
  }

  type BlogPostPage {
    items: [BlogPostSummary!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  """
  One post in full. body is the Markdown as written, with blog-image:<id> where
  an image goes; images gives each id a link to show it from.
  """
  type BlogPost {
    id: ID!
    title: String!
    body: String!
    images: [BlogImage!]!
    author: BlogAuthor
    tags: [BlogTag!]!
    status: BlogPostStatus!
    """
    What an edit sends back (updateBlogPost) so a post that changed since it was
    opened - a moderator hid it, say - is refused instead of overwritten. A
    Float, on purpose: the backend counts it as 64-bit, and GraphQL's Int is
    32-bit.
    """
    version: Float!
    likeCount: Int!
    commentCount: Int!
    likedByMe: Boolean!
    canEdit: Boolean!
    """
    Whether comments and likes are open: false for a post that is hidden or
    removed.
    """
    canInteract: Boolean!
    createdAt: DateTime!
    editedAt: DateTime
    """
    Why a moderator hid or removed the post. Set only for its author, and only
    while it is not published.
    """
    moderationNote: String
  }

  type BlogComment {
    id: ID!
    postId: ID!
    author: BlogAuthor
    body: String!
    status: BlogCommentStatus!
    canEdit: Boolean!
    createdAt: DateTime!
    editedAt: DateTime
  }

  type BlogCommentPage {
    items: [BlogComment!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type BlogLikeState {
    liked: Boolean!
    likeCount: Int!
  }

  type BlogSaveState {
    postId: ID!
    saved: Boolean!
  }

  """
  A post and why it is recommended. matchedTags are the post's tags that are
  what the viewer declared (their certificate, skills and level); empty for
  POPULAR_THIS_WEEK and LATEST.
  """
  type BlogRecommendation {
    post: BlogPostSummary!
    kind: BlogRecommendationKind!
    matchedTags: [BlogTag!]!
  }

  """
  Where to PUT the image bytes (with the same content type). Once that is done,
  write reference - blog-image:<id> - into the Markdown where the image goes and
  save the post.
  """
  type BlogImageUpload {
    imageId: ID!
    uploadUrl: String!
    contentType: String!
    expiresInSeconds: Int!
    reference: String!
  }

  type BlogReport {
    id: ID!
    targetType: BlogTargetType!
    targetId: ID!
    reason: BlogReportReason!
    detail: String
    status: BlogReportStatus!
    createdAt: DateTime!
  }

  input BlogTagInput {
    kind: BlogTagKind!
    value: String!
  }

  input SaveBlogPostInput {
    title: String!
    body: String!
    tags: [BlogTagInput!]!
  }

  """
  One piece of reported content in the moderation queue, however many reports it
  has. Once the author deleted it (targetStatus DELETED) title, excerpt and
  author are null.
  """
  type BlogModerationQueueItem {
    targetType: BlogTargetType!
    targetId: ID!
    """
    A post's title; for a comment, the title of the post it is on.
    """
    title: String
    excerpt: String
    author: BlogAuthor
    targetStatus: BlogTargetStatus!
    openReports: Int!
    reasons: [BlogReportReason!]!
    firstReportedAt: DateTime!
    lastReportedAt: DateTime!
  }

  type BlogModerationQueuePage {
    items: [BlogModerationQueueItem!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  """
  What a moderator is reading. For a comment, title and postId are those of the
  post it is on, and images and tags are empty; for a post postId is null.
  """
  type BlogModerationContent {
    title: String
    body: String!
    images: [BlogImage!]!
    tags: [BlogTag!]!
    postId: ID
    createdAt: DateTime!
  }

  type BlogModerationReport {
    id: ID!
    reporter: BlogAuthor
    reason: BlogReportReason!
    detail: String
    status: BlogReportStatus!
    resolutionNote: String
    createdAt: DateTime!
    resolvedAt: DateTime
  }

  """
  One thing a moderator did to the content in front of them.
  """
  type BlogModerationTargetAction {
    id: ID!
    action: BlogModerationAction!
    reason: String!
    moderator: BlogAuthor
    createdAt: DateTime!
  }

  """
  Reported content in any status, with every report about it and the history of
  what was done. content and author are null once the author deleted it.
  """
  type BlogModerationTarget {
    targetType: BlogTargetType!
    targetId: ID!
    targetStatus: BlogTargetStatus!
    content: BlogModerationContent
    author: BlogAuthor
    reports: [BlogModerationReport!]!
    actions: [BlogModerationTargetAction!]!
  }

  """
  One entry of the history of moderation, with what it was done to.
  """
  type BlogModerationActionRecord {
    id: ID!
    targetType: BlogTargetType!
    targetId: ID!
    action: BlogModerationAction!
    reason: String!
    moderator: BlogAuthor
    createdAt: DateTime!
  }

  type BlogModerationActionPage {
    items: [BlogModerationActionRecord!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  extend type UserWall {
    """
    Posts by the wall's owner. Null when the wall is unavailable (blocked either
    way) or the call failed. On the viewer's own wall the backend also lists
    their hidden and removed posts, with their status.
    """
    posts(page: Int, size: Int): BlogPostPage
  }

  extend type Query {
    """
    Published posts. q searches titles and is refused with extensions.backendCode
    SEARCH_TERM_TOO_SHORT below the backend's minimum. skill, level and
    certificate are values from blogTagCatalogue and combine with AND. authorId
    lists one person's posts - the viewer's own include every status.
    """
    blogPosts(
      q: String
      skill: String
      level: String
      certificate: String
      authorId: ID
      sort: BlogPostSort
      page: Int
      size: Int
    ): BlogPostPage!
    """
    One post. A post that does not exist, is hidden from the viewer or is by
    someone they have a block with is the same BLOG_POST_NOT_FOUND.
    """
    blogPost(id: ID!): BlogPost!
    """
    Comments of a post, oldest first. The viewer's own hidden or removed ones are
    in the list, with their status.
    """
    blogComments(postId: ID!, page: Int, size: Int): BlogCommentPage!
    blogTagCatalogue: BlogTagCatalogue!
    """
    The best posts for the viewer, best first: the same ones for the same data,
    nothing rotates. Fewer than limit (3 unless asked, at most 10) when fewer
    qualify, and an empty list when nothing does.
    """
    blogRecommendations(limit: Int): [BlogRecommendation!]!
    """
    The posts the viewer saved and may still read, the latest save first.
    """
    savedBlogPosts(page: Int, size: Int): BlogPostPage!

    """
    Staff and Admin. Content with open reports, one entry for each however many
    reports it has.
    """
    adminBlogQueue(
      type: BlogTargetType
      sort: BlogQueueSort
      page: Int
      size: Int
    ): BlogModerationQueuePage!
    adminBlogTarget(type: BlogTargetType!, id: ID!): BlogModerationTarget!
    """
    Staff and Admin. What moderators did, newest first.
    """
    adminBlogActions(page: Int, size: Int): BlogModerationActionPage!
  }

  extend type Mutation {
    createBlogPost(input: SaveBlogPostInput!): BlogPost!
    """
    version is the one the post had when it was opened. A post that changed since
    is refused with extensions.backendCode BLOG_POST_STALE.
    """
    updateBlogPost(
      id: ID!
      input: SaveBlogPostInput!
      version: Float!
    ): BlogPost!
    deleteBlogPost(id: ID!): Boolean!
    likeBlogPost(id: ID!): BlogLikeState!
    unlikeBlogPost(id: ID!): BlogLikeState!
    saveBlogPost(id: ID!): BlogSaveState!
    unsaveBlogPost(id: ID!): BlogSaveState!
    createBlogComment(postId: ID!, body: String!): BlogComment!
    updateBlogComment(id: ID!, body: String!): BlogComment!
    deleteBlogComment(id: ID!): Boolean!
    startBlogImageUpload(
      contentType: String!
      contentLength: Int!
    ): BlogImageUpload!
    """
    Reporting again while the viewer's own report of it is open answers with that
    report.
    """
    reportBlogPost(
      id: ID!
      reason: BlogReportReason!
      detail: String
    ): BlogReport!
    reportBlogComment(
      id: ID!
      reason: BlogReportReason!
      detail: String
    ): BlogReport!

    """
    Staff and Admin. Answers with the content as it is afterwards. Refused for
    content the moderator wrote (BLOG_MODERATION_OWN_CONTENT).
    """
    adminModerateBlog(
      type: BlogTargetType!
      id: ID!
      action: BlogModerationAction!
      reason: String!
    ): BlogModerationTarget!
  }
`;
