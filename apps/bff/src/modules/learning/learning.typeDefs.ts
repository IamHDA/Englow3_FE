export const learningTypeDefs = `#graphql
  enum FlashcardReviewStatus {
    NEW
    LEARNING
    REVIEW
    MASTERED
  }

  """
  What the learner said about a card. SM-2 grades answers 0-5; these are the
  four buttons the interface offers, and the backend maps them onto the
  algorithm. Only AGAIN counts as a failure.
  """
  enum ReviewRating {
    AGAIN
    HARD
    GOOD
    EASY
  }

  type FlashcardSet {
    id: ID!
    slug: String!
    name: String!
    description: String!
    topic: String!
    """Null on a set that deliberately mixes levels."""
    targetLevel: String
    cardCount: Int!
    """
    Per learner, not per set: two learners looking at the same set see
    different numbers, which is why these are not fields of the set itself.
    """
    dueCount: Int!
    masteredCount: Int!
    """Null until the learner has answered a card in this set."""
    lastStudiedAt: DateTime
  }

  type FlashcardSetPage {
    items: [FlashcardSet!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type Flashcard {
    id: ID!
    orderNo: Int!
    lemma: String!
    partOfSpeech: String!
    """Which sense the card teaches - "bank (river)" is not "bank (money)"."""
    senseLabel: String!
    ipaUs: String!
    ipaUk: String
    """Pre-signed and short-lived - the backend resolves the object key."""
    audioUsUrl: String
    audioUkUrl: String
    definitionEn: String!
    definitionVi: String!
    exampleSentence: String!
    exampleTranslationVi: String
    mnemonicTipVi: String
    cefrLevel: String
    status: FlashcardReviewStatus!
    """Null for a card the learner has never answered."""
    dueAt: DateTime
    lapseCount: Int!
  }

  type FlashcardSetDetail {
    set: FlashcardSet!
    cards: [Flashcard!]!
  }

  type FlashcardReview {
    flashcardId: ID!
    status: FlashcardReviewStatus!
    repetitions: Int!
    intervalDays: Int!
    dueAt: DateTime!
    lapseCount: Int!
  }

  extend type Query {
    flashcardSets(
      topic: String
      title: String
      page: Int = 0
      size: Int = 20
    ): FlashcardSetPage!

    flashcardSet(id: ID!): FlashcardSetDetail!

    """
    What to study now: cards that are due, then unseen ones to fill the
    session. The ordering is the backend's - a card about to be forgotten is
    worth more than a new one, and reordering here would undo the schedule.
    """
    flashcardStudyQueue(setId: ID!, limit: Int = 20): [Flashcard!]!
  }

  extend type Mutation {
    """
    Records one answer and returns where the card now sits. Creates the review
    row on first sight, so browsing a set costs nothing until it is studied.
    """
    rateFlashcard(
      flashcardId: ID!
      rating: ReviewRating!
      timeSpentSeconds: Int!
    ): FlashcardReview!
  }
`;
