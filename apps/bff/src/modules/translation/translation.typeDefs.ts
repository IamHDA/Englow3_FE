export const translationTypeDefs = /* GraphQL */ `
  """
  Where one translation stands. There is no RUNNING: QUEUED - "we have it and
  there is no grade yet" - is all a learner waiting needs to know.
  """
  enum TranslationAttemptStatus {
    QUEUED
    GRADED
    FAILED
  }

  """
  A band derived on the server from the total, never asked of the model.
  """
  enum TranslationVerdict {
    EXCELLENT
    GOOD
    PARTIAL
    NEEDS_WORK
  }

  enum TranslationMistakeType {
    MEANING
    GRAMMAR
    VOCABULARY
    SPELLING
    WORD_ORDER
    OTHER
  }

  type TranslationSet {
    id: ID!
    slug: String!
    title: String!
    topic: String!
    targetLevel: String
    description: String
    itemCount: Int!
    """
    Sentences this learner has a graded attempt at.
    """
    gradedCount: Int!
  }

  type TranslationSetPage {
    items: [TranslationSet!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type TranslationLatestAttempt {
    id: ID!
    status: TranslationAttemptStatus!
    score: Int
  }

  """
  One Vietnamese sentence to translate. The reference translation is not here:
  it comes with a graded attempt, after the learner has answered.
  """
  type TranslationItem {
    id: ID!
    orderNo: Int!
    sourceVi: String!
    latestAttempt: TranslationLatestAttempt
  }

  type TranslationSetDetail {
    set: TranslationSet!
    items: [TranslationItem!]!
  }

  """
  Points per part: meaning out of 40, grammar 30, vocabulary 20, naturalness 10.
  """
  type TranslationParts {
    meaning: Int!
    grammar: Int!
    vocabulary: Int!
    naturalness: Int!
  }

  type TranslationMistake {
    type: TranslationMistakeType!
    """
    The learner's own words.
    """
    original: String!
    correction: String!
    """
    In Vietnamese.
    """
    explanation: String!
  }

  type TranslationFeedback {
    verdict: TranslationVerdict!
    parts: TranslationParts!
    summary: String!
    """
    The learner's sentence corrected and made natural.
    """
    improved: String!
    errors: [TranslationMistake!]!
  }

  type TranslationAttempt {
    id: ID!
    setId: ID!
    itemId: ID!
    sourceVi: String!
    response: String!
    status: TranslationAttemptStatus!
    """
    0 to 100. Null until graded.
    """
    score: Int
    feedback: TranslationFeedback
    errorCode: String
    """
    Null while the attempt is still waiting.
    """
    referenceEn: String
    notes: String
    createdAt: DateTime!
    gradedAt: DateTime
  }

  type TranslationAttemptPage {
    items: [TranslationAttempt!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  extend type Query {
    translationSets(
      topic: String
      title: String
      page: Int = 0
      size: Int = 20
    ): TranslationSetPage!

    translationSet(id: ID!): TranslationSetDetail!

    """
    What the practice screen polls while it waits for a grade.
    """
    translationAttempt(id: ID!): TranslationAttempt!

    """
    This learner's own attempts, newest first.
    """
    translationAttempts(page: Int = 0, size: Int = 20): TranslationAttemptPage!
  }

  extend type Mutation {
    """
    Records the translation and queues its grading. Refused with
    extensions.backendCode TRANSLATION_DAILY_LIMIT_REACHED once today's AI
    allowance is spent.
    """
    submitTranslation(itemId: ID!, response: String!): TranslationAttempt!
  }
`;
