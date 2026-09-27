export const dictationTypeDefs = /* GraphQL */ `
  type DictationLesson {
    id: ID!
    slug: String!
    title: String!
    topic: String!
    targetLevel: String
    sentenceCount: Int!
    """Per learner: sentences whose best attempt cleared the completion threshold."""
    completedSentenceCount: Int!
    totalDurationSeconds: Int!
    lastPractisedAt: DateTime
  }

  type DictationLessonPage {
    items: [DictationLesson!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  """
  A sentence as the learner practises it. There is no transcript on this type
  at all - the answer is a different shape entirely, produced only once they
  have committed one of their own.
  """
  type DictationSentence {
    id: ID!
    orderNo: Int!
    """Pre-signed and short-lived."""
    audioUrl: String!
    audioDurationSeconds: Int!
    """Counted by the same scorer that marks the answer, so the two agree."""
    hintWordCount: Int!
    hintFirstLetters: String
    hintRevealWord: String
    hintPartialTranscript: String
    """
    Where this sentence begins inside audioUrl, for a lesson cut from one long
    recording. Null on both means the file is this sentence and nothing else,
    which is what a lesson with a clip per line has always meant - so a player
    that ignores them keeps working on older content.
    """
    audioStartMs: Int
    audioEndMs: Int
    """The learner's best attempt on this line so far. Null if never tried."""
    bestAccuracyPercent: Float
  }

  type DictationLessonDetail {
    lesson: DictationLesson!
    sentences: [DictationSentence!]!
  }

  """The only type that carries the transcript."""
  type DictationSubmission {
    sentenceId: ID!
    correctText: String!
    translationVi: String
    response: String!
    accuracyPercent: Float!
    correctWordCount: Int!
    totalWordCount: Int!
    """
    Whether the line now counts as done, by the server's one rule. Sent so no
    screen compares the accuracy to a threshold of its own.
    """
    cleared: Boolean!
  }

  type DictationDailyAccuracy {
    day: Date!
    accuracyPercent: Int!
    attemptCount: Int!
  }

  type DictationMissedWord {
    word: String!
    missedCount: Int!
    correctCount: Int!
    accuracyPercent: Int!
  }

  type DictationDifficultSentence {
    sentenceId: ID!
    text: String!
    topic: String!
    accuracyPercent: Int!
    attemptCount: Int!
  }

  type DictationSessionSummary {
    day: Date!
    lessonId: ID!
    lessonTitle: String!
    sentenceCount: Int!
    accuracyPercent: Int!
    listeningSeconds: Int!
  }

  type DictationStats {
    periodDays: Int!
    lessonsCompleted: Int!
    averageAccuracyPercent: Int!
    listeningSeconds: Int!
    sentencesPractised: Int!
    streakDays: Int!
    activity: [DictationDailyAccuracy!]!
    """
    Recomputed from recent answers rather than stored - ordered by accuracy, so
    a word missed twice out of two ranks above one missed three times in thirty.
    """
    missedWords: [DictationMissedWord!]!
    difficultSentences: [DictationDifficultSentence!]!
    history: [DictationSessionSummary!]!
  }

  """
  One line to practise again.

  No transcript, like DictationSentence. It used to carry one - every row is a
  line the learner has already answered - but the screen then graded in the
  browser and never told the server, so reviewed lines were never recorded and
  came back on the next visit. Review now submits like practice does, and the
  answer arrives in that response, after one has been committed.
  """
  type MistakeSentence {
    sentenceId: ID!
    """Pre-signed and short-lived."""
    audioUrl: String!
    audioDurationSeconds: Int!
    "Where the line sits inside audioUrl, for a lesson cut from one passage."
    audioStartMs: Int
    audioEndMs: Int
    lessonId: ID!
    lessonTitle: String!
    """Their best attempt so far - the reason this line is still in the queue."""
    bestAccuracyPercent: Int!
    attemptCount: Int!
    """The last thing they typed, so the screen can show what changed."""
    lastResponse: String
  }

  extend type Query {
    dictationLessons(
      topic: String
      title: String
      page: Int = 0
      size: Int = 20
    ): DictationLessonPage!

    dictationLesson(id: ID!): DictationLessonDetail!

    dictationStats(periodDays: Int = 7): DictationStats!

    """
    Lines this learner keeps getting wrong, worst first, across every lesson.
    Not per lesson: "what do I keep getting wrong" is a question about the
    learner, and the worst ten in one lesson are usually not the ten worth
    practising.
    """
    dictationMistakes: [MistakeSentence!]!
  }

  extend type Mutation {
    """
    Marks one transcription and returns the correct text with it. An empty
    answer is a real answer - it scores zero rather than being rejected.
    """
    submitDictation(sentenceId: ID!, response: String!): DictationSubmission!
  }
`;
