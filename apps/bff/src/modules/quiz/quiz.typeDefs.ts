export const quizTypeDefs = `#graphql
  enum QuizQuestionType {
    MULTIPLE_CHOICE
    FILL_BLANK
    REWRITE
    REORDER
    MATCHING
  }

  enum QuizAttemptStatus {
    IN_PROGRESS
    SCORED
    EXPIRED
  }

  type Quiz {
    id: ID!
    slug: String!
    title: String!
    description: String!
    category: String!
    targetLevel: String
    timeLimitSeconds: Int!
    """Percentage, so a quiz can gain a question without its pass mark shifting."""
    passingScorePercent: Int!
    questionCount: Int!
    """Per learner. Null until they have finished one."""
    bestScorePercent: Float
    attemptCount: Int!
  }

  type QuizPage {
    items: [Quiz!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  """
  An option as the learner sees it while sitting. There is no correctness flag
  on this type at all - the answer key is a different shape entirely, so there
  is no field here to forget to clear.
  """
  type QuizOption {
    id: ID!
    orderNo: Int!
    label: String!
    content: String!
  }

  type QuizPaperQuestion {
    id: ID!
    orderNo: Int!
    questionType: QuizQuestionType!
    title: String!
    prompt: String!
    points: Int!
    """FILL_BLANK renders as "<before> ___ <after>"; null on every other type."""
    beforeText: String
    afterText: String
    originalSentence: String
    rewriteKeyword: String
    options: [QuizOption!]!
    wordBank: [String!]!
    scrambledWords: [String!]!
    leftTexts: [String!]!
    """
    Shuffled by the backend, seeded from the attempt: the stored order is the
    answer, and reloading must not deal a new puzzle.
    """
    rightTexts: [String!]!
  }

  type QuizPaper {
    attemptId: ID!
    quizId: ID!
    title: String!
    description: String!
    timeLimitSeconds: Int!
    expiresAt: DateTime!
    questions: [QuizPaperQuestion!]!
  }

  type QuizQuestionReview {
    questionId: ID!
    questionType: QuizQuestionType!
    prompt: String!
    userAnswerText: String!
    correctAnswerText: String!
    correct: Boolean!
    pointsEarned: Float!
    pointsPossible: Int!
    explanation: String!
  }

  type QuizAttempt {
    id: ID!
    quizId: ID!
    quizTitle: String!
    status: QuizAttemptStatus!
    startedAt: DateTime!
    expiresAt: DateTime!
    submittedAt: DateTime
    """Null until the attempt is scored."""
    score: Float
    maxScore: Float!
    scorePercentage: Float
    correctAnswerCount: Int
    questionCount: Int!
    passed: Boolean
    """True when the backend handed back an attempt that was already open."""
    resumed: Boolean!
    """Empty while the attempt is IN_PROGRESS - it carries the answer key."""
    reviews: [QuizQuestionReview!]!
  }

  input QuizAnswerInput {
    questionId: ID!
    """
    What an answer means depends on the type: an option id, a typed phrase, the
    chosen words joined by spaces, or the matched halves joined by "|".
    """
    response: String!
  }

  extend type Query {
    quizzes(
      category: String
      title: String
      page: Int = 0
      size: Int = 20
    ): QuizPage!

    """The paper to sit, reachable only through an open attempt."""
    quizPaper(attemptId: ID!): QuizPaper!

    """The scored attempt. Carries the answer key, so only worth reading once scored."""
    quizAttempt(id: ID!): QuizAttempt!
  }

  extend type Mutation {
    """
    Opens an attempt, or returns the one already open with resumed: true. The
    backend enforces one live attempt per learner and quiz.
    """
    startQuizAttempt(quizId: ID!): QuizAttempt!

    """
    Submits and scores in one step. A question left out is marked wrong rather
    than skipped, so the percentage means what it says.
    """
    submitQuizAttempt(attemptId: ID!, answers: [QuizAnswerInput!]!): QuizAttempt!
  }
`;
