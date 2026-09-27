export const contentManagementTypeDefs = /* GraphQL */ `
  """
  Everything the overview counts: the four kinds of authored content, and exams.
  """
  enum OverviewContentKind {
    FLASHCARD_SET
    QUIZ
    DICTATION_LESSON
    SPEAKING_PROMPT
    EXAM
  }

  type OverviewContentCounts {
    kind: OverviewContentKind!
    drafts: Int!
    pendingReview: Int!
    published: Int!
  }

  """
  The administrator's landing page: what is waiting on a decision, how much is
  live, and whether anyone is using it.
  """
  type AdminOverview {
    content: [OverviewContentCounts!]!
    """Items of every kind waiting on review."""
    pendingReviewTotal: Int!
    learners: Int!
    """Learners who signed up within the period."""
    newLearners: Int!
    """Learners who did anything within the period, each counted once."""
    activeLearners: Int!
    cardReviews: Int!
    dictationSentences: Int!
    quizzesSubmitted: Int!
    examsSubmitted: Int!
    """Days the activity figures cover."""
    periodDays: Int!
  }

  """
  The four kinds of authored content. They share one review workflow, so this
  schema presents one surface over four backend resources rather than four
  copies of the same six operations.
  """
  enum ContentKind {
    FLASHCARD_SET
    QUIZ
    DICTATION_LESSON
    SPEAKING_PROMPT
  }

  """
  DRAFT -> PENDING_REVIEW -> PUBLISHED, with REJECTED as the way back. The
  backend keeps a separate enum per content type; the values are identical by
  construction and this is what validates them on the wire.
  """
  enum ContentStatus {
    DRAFT
    PENDING_REVIEW
    REJECTED
    PUBLISHED
    ARCHIVED
  }

  """
  A piece of content as its author and reviewer see it. Never sent to a learner:
  it carries the rejection note, and nobody studying should read "rejected
  because the audio is unusable".
  """
  type ContentReview {
    id: ID!
    slug: String!
    title: String!
    status: ContentStatus!
    """
    Cards, questions or sentences - whatever this kind is made of. Null for a
    speaking prompt, which is one sentence rather than a collection: "1 item"
    would be true and would tell a reviewer nothing.
    """
    itemCount: Int
    createdAt: DateTime!
    publishedAt: DateTime
    submittedForReviewAt: DateTime
    reviewedByUserId: ID
    reviewedAt: DateTime
    """Why it came back, in the reviewer words. Required when rejecting."""
    reviewNote: String
  }

  type ContentReviewPage {
    items: [ContentReview!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  extend type Query {
    """
    The authoring list for one kind of content, at every status. Omitting
    status asks for all of them, so this serves both the full list and the
    review queue. Staff and administrators only - the backend answers 403 to
    anyone else.
    """
    adminContent(
      kind: ContentKind!
      status: ContentStatus
      title: String
      page: Int = 0
      size: Int = 20
    ): ContentReviewPage!

    """Staff and administrators only."""
    adminOverview: AdminOverview!
  }

  extend type Mutation {
    """
    DRAFT or REJECTED -> PENDING_REVIEW. Staff as well as administrators. Held
    to the publication rules at this end too, so a reviewer is never handed an
    empty set: the refusal arrives as extensions.backendCode.
    """
    submitContentForReview(kind: ContentKind!, id: ID!): ContentReview!

    """
    PENDING_REVIEW -> PUBLISHED, administrators only. Approving publishes in the
    same step - there is no approved-but-unpublished state.
    """
    approveContent(kind: ContentKind!, id: ID!): ContentReview!

    """
    PENDING_REVIEW -> REJECTED, administrators only. The note is required: the
    backend refuses a blank one with REVIEW_NOTE_REQUIRED, because "rejected"
    alone leaves the author nothing to change.
    """
    rejectContent(kind: ContentKind!, id: ID!, note: String!): ContentReview!

    """DRAFT -> PUBLISHED, skipping review. Administrators only."""
    publishContent(kind: ContentKind!, id: ID!): ContentReview!

    """Anything -> ARCHIVED. Administrators only. There is no delete."""
    archiveContent(kind: ContentKind!, id: ID!): ContentReview!
  }
`;
