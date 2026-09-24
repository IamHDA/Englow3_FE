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

  type FlashcardDailyActivity {
    day: Date!
    cardCount: Int!
  }

  type FlashcardDifficultCard {
    flashcardId: ID!
    lemma: String!
    setName: String!
    """
    Times the card was lost after having been learned. Not the same as times
    failed: failing a card still being learned is ordinary progress.
    """
    lapseCount: Int!
    lastReviewed: DateTime
  }

  type FlashcardSessionSummary {
    day: Date!
    setId: ID!
    setName: String!
    cardCount: Int!
    recallPercent: Int!
    studySeconds: Int!
  }

  type FlashcardStats {
    periodDays: Int!
    cardsStudied: Int!
    retentionPercent: Int!
    studySeconds: Int!
    """Counted over a year, not the period - a 7-day view still shows a 40-day streak."""
    streakDays: Int!
    activity: [FlashcardDailyActivity!]!
    difficultCards: [FlashcardDifficultCard!]!
    history: [FlashcardSessionSummary!]!
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

    dictationLessons(
      topic: String
      title: String
      page: Int = 0
      size: Int = 20
    ): DictationLessonPage!

    dictationLesson(id: ID!): DictationLessonDetail!

    """
    Everything the statistics screen shows, in one call. Six round trips to
    draw one page is the problem a BFF exists to avoid.
    """
    flashcardStats(periodDays: Int = 7): FlashcardStats!

    dictationStats(periodDays: Int = 7): DictationStats!

    """
    Lines this learner keeps getting wrong, worst first, across every lesson.
    Not per lesson: "what do I keep getting wrong" is a question about the
    learner, and the worst ten in one lesson are usually not the ten worth
    practising.
    """
    dictationMistakes: [MistakeSentence!]!

    """
    The learner's own plan for today: streak, points, roadmap and goals. Takes
    no argument because the only path anyone can read is their own.
    """
    dailyPath: DailyPath!

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

    """
    Marks one transcription and returns the correct text with it. An empty
    answer is a real answer - it scores zero rather than being rejected.
    """
    submitDictation(sentenceId: ID!, response: String!): DictationSubmission!

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
