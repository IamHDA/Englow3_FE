export const progressTypeDefs = /* GraphQL */ `
  enum DailyTaskKind {
    """Cards the spaced-repetition schedule says are due."""
    FLASHCARD_REVIEW
    DICTATION
    QUIZ
  }

  """
  There is deliberately no LOCKED. Nothing gates one piece of content behind
  another, so UPCOMING says "not started" rather than "you may not".
  """
  enum DailyTaskStatus {
    COMPLETED
    CURRENT
    UPCOMING
  }

  enum DailyQuestKind {
    REVIEW_DUE_CARDS
    PASS_A_QUIZ
    TYPE_SENTENCES
    PRACTISE_EVERY_DAY
  }

  type DailyTask {
    kind: DailyTaskKind!
    status: DailyTaskStatus!
    """The set, lesson or quiz to open. The link is built from this and the kind."""
    targetId: ID!
    title: String!
    order: Int!
    """Cards due, sentences left, or questions in the quiz."""
    unitsRemaining: Int!
    unitsDoneToday: Int!
    """How far through it the learner is, or null if they have never opened it."""
    completionPercent: Int
    """What finishing it pays, from the same weights the counter pays from."""
    xpReward: Int!
  }

  type DailyQuest {
    kind: DailyQuestKind!
    progress: Int!
    target: Int!
    completed: Boolean!
  }

  type DailyPath {
    """Consecutive days with any practice, counted across every feature."""
    streakDays: Int!
    """Derived from the activity tables on every read. There is no points ledger."""
    totalXp: Int!
    level: Int!
    xpIntoLevel: Int!
    levelCostXp: Int!
    tasks: [DailyTask!]!
    quests: [DailyQuest!]!
  }

  extend type Query {
    """
    The learner's own plan for today: streak, points, roadmap and goals. Takes
    no argument because the only path anyone can read is their own.
    """
    dailyPath: DailyPath!
  }
`;
