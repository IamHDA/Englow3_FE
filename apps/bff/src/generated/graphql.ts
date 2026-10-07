import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { GraphQLContext } from '../graphql/context.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: string; output: string; }
  DateTime: { input: string; output: string; }
};

/**
 * The administrator's landing page: what is waiting on a decision, how much is
 * live, and whether anyone is using it.
 */
export type AdminOverview = {
  __typename?: 'AdminOverview';
  /** Learners who did anything within the period, each counted once. */
  activeLearners: Scalars['Int']['output'];
  cardReviews: Scalars['Int']['output'];
  content: Array<OverviewContentCounts>;
  dictationSentences: Scalars['Int']['output'];
  examsSubmitted: Scalars['Int']['output'];
  learners: Scalars['Int']['output'];
  /** Learners who signed up within the period. */
  newLearners: Scalars['Int']['output'];
  /** Items of every kind waiting on review. */
  pendingReviewTotal: Scalars['Int']['output'];
  /** Days the activity figures cover. */
  periodDays: Scalars['Int']['output'];
  quizzesSubmitted: Scalars['Int']['output'];
};

export type AssessmentAttempt = {
  __typename?: 'AssessmentAttempt';
  answerText: Scalars['String']['output'];
  assessedAt?: Maybe<Scalars['DateTime']['output']>;
  audioUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  errorCode?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  learnerId?: Maybe<Scalars['ID']['output']>;
  learnerName?: Maybe<Scalars['String']['output']>;
  recognizedText?: Maybe<Scalars['String']['output']>;
  report?: Maybe<Scalars['String']['output']>;
  skill: AssessmentSkill;
  source?: Maybe<Scalars['String']['output']>;
  status: AssessmentAttemptStatus;
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  task: AssessmentTask;
  taskId: Scalars['ID']['output'];
  version: Scalars['Int']['output'];
  wordCount: Scalars['Int']['output'];
};

export type AssessmentAttemptPage = {
  __typename?: 'AssessmentAttemptPage';
  items: Array<AssessmentAttempt>;
  page: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AssessmentAttemptStatus =
  | 'COMPLETED'
  | 'DRAFT'
  | 'FAILED'
  | 'NEEDS_REVIEW'
  | 'QUEUED';

export type AssessmentCapabilities = {
  __typename?: 'AssessmentCapabilities';
  automaticSpeaking: Scalars['Boolean']['output'];
  automaticWriting: Scalars['Boolean']['output'];
  humanReview: Scalars['Boolean']['output'];
};

export type AssessmentNotification = {
  __typename?: 'AssessmentNotification';
  assessedAt: Scalars['DateTime']['output'];
  attemptId: Scalars['ID']['output'];
  skill: AssessmentSkill;
  title: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type AssessmentNotificationPage = {
  __typename?: 'AssessmentNotificationPage';
  items: Array<AssessmentNotification>;
  page: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AssessmentReview = {
  __typename?: 'AssessmentReview';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  note: Scalars['String']['output'];
  previousReport?: Maybe<Scalars['String']['output']>;
  report: Scalars['String']['output'];
  reviewerId: Scalars['ID']['output'];
  reviewerName?: Maybe<Scalars['String']['output']>;
};

export type AssessmentSkill =
  | 'SPEAKING'
  | 'WRITING';

export type AssessmentSubmissionPage = {
  __typename?: 'AssessmentSubmissionPage';
  items: Array<AssessmentSubmissionSummary>;
  page: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AssessmentSubmissionSummary = {
  __typename?: 'AssessmentSubmissionSummary';
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  learnerName?: Maybe<Scalars['String']['output']>;
  skill: AssessmentSkill;
  status: AssessmentAttemptStatus;
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  task: AssessmentSubmissionTask;
  version: Scalars['Int']['output'];
};

export type AssessmentSubmissionTask = {
  __typename?: 'AssessmentSubmissionTask';
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type AssessmentTask = {
  __typename?: 'AssessmentTask';
  id: Scalars['ID']['output'];
  instructions: Scalars['String']['output'];
  minimumWords: Scalars['Int']['output'];
  reviewNote?: Maybe<Scalars['String']['output']>;
  rubricNotes?: Maybe<Scalars['String']['output']>;
  sampleAnswer?: Maybe<Scalars['String']['output']>;
  skill: AssessmentSkill;
  status: AssessmentTaskStatus;
  taskType: Scalars['String']['output'];
  timeLimitSeconds: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type AssessmentTaskInput = {
  instructions: Scalars['String']['input'];
  minimumWords: Scalars['Int']['input'];
  rubricNotes?: InputMaybe<Scalars['String']['input']>;
  sampleAnswer?: InputMaybe<Scalars['String']['input']>;
  skill: AssessmentSkill;
  taskType: Scalars['String']['input'];
  timeLimitSeconds: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};

export type AssessmentTaskPage = {
  __typename?: 'AssessmentTaskPage';
  items: Array<AssessmentTask>;
  page: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AssessmentTaskStatus =
  | 'ARCHIVED'
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED';

export type AssessmentUpload = {
  __typename?: 'AssessmentUpload';
  attempt: AssessmentAttempt;
  uploadUrl?: Maybe<Scalars['String']['output']>;
};

export type AssessmentWorkload = {
  __typename?: 'AssessmentWorkload';
  completed: Scalars['Int']['output'];
  drafts: Scalars['Int']['output'];
  failed: Scalars['Int']['output'];
  needsReview: Scalars['Int']['output'];
  pendingReview: Scalars['Int']['output'];
  published: Scalars['Int']['output'];
  rejected: Scalars['Int']['output'];
};

export type AttemptOptionReview = {
  __typename?: 'AttemptOptionReview';
  correct: Scalars['Boolean']['output'];
  explanation?: Maybe<Scalars['String']['output']>;
  optionId: Scalars['ID']['output'];
};

export type AttemptQuestionReview = {
  __typename?: 'AttemptQuestionReview';
  awardedRawScore: Scalars['Float']['output'];
  correct: Scalars['Boolean']['output'];
  correctOptionIds: Array<Scalars['ID']['output']>;
  explanation?: Maybe<Scalars['String']['output']>;
  options: Array<AttemptOptionReview>;
  questionId: Scalars['ID']['output'];
  selectedOptionIds: Array<Scalars['ID']['output']>;
};

export type CefrLevel =
  | 'A1'
  | 'A2'
  | 'B1'
  | 'B2'
  | 'C1'
  | 'C2';

export type CertificateType =
  | 'IELTS'
  | 'TOEIC';

export type CertificateVariant =
  | 'ACADEMIC'
  | 'GENERAL'
  | 'LR'
  | 'SW';

/**
 * The four kinds of authored content. They share one review workflow, so this
 * schema presents one surface over four backend resources rather than four
 * copies of the same six operations.
 */
export type ContentKind =
  | 'DICTATION_LESSON'
  | 'FLASHCARD_SET'
  | 'QUIZ'
  | 'SPEAKING_PROMPT';

/**
 * A piece of content as its author and reviewer see it. Never sent to a learner:
 * it carries the rejection note, and nobody studying should read "rejected
 * because the audio is unusable".
 */
export type ContentReview = {
  __typename?: 'ContentReview';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /**
   * Cards, questions or sentences - whatever this kind is made of. Null for a
   * speaking prompt, which is one sentence rather than a collection: "1 item"
   * would be true and would tell a reviewer nothing.
   */
  itemCount?: Maybe<Scalars['Int']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Why it came back, in the reviewer words. Required when rejecting. */
  reviewNote?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedByUserId?: Maybe<Scalars['ID']['output']>;
  slug: Scalars['String']['output'];
  status: ContentStatus;
  submittedForReviewAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
};

export type ContentReviewPage = {
  __typename?: 'ContentReviewPage';
  items: Array<ContentReview>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

/**
 * DRAFT -> PENDING_REVIEW -> PUBLISHED, with REJECTED as the way back. The
 * backend keeps a separate enum per content type; the values are identical by
 * construction and this is what validates them on the wire.
 */
export type ContentStatus =
  | 'ARCHIVED'
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED';

export type DailyPath = {
  __typename?: 'DailyPath';
  level: Scalars['Int']['output'];
  levelCostXp: Scalars['Int']['output'];
  quests: Array<DailyQuest>;
  /** Consecutive days with any practice, counted across every feature. */
  streakDays: Scalars['Int']['output'];
  tasks: Array<DailyTask>;
  /** Derived from the activity tables on every read. There is no points ledger. */
  totalXp: Scalars['Int']['output'];
  xpIntoLevel: Scalars['Int']['output'];
};

export type DailyQuest = {
  __typename?: 'DailyQuest';
  completed: Scalars['Boolean']['output'];
  kind: DailyQuestKind;
  progress: Scalars['Int']['output'];
  target: Scalars['Int']['output'];
};

export type DailyQuestKind =
  | 'PASS_A_QUIZ'
  | 'PRACTISE_EVERY_DAY'
  | 'REVIEW_DUE_CARDS'
  | 'TYPE_SENTENCES';

export type DailyTask = {
  __typename?: 'DailyTask';
  /** How far through it the learner is, or null if they have never opened it. */
  completionPercent?: Maybe<Scalars['Int']['output']>;
  kind: DailyTaskKind;
  order: Scalars['Int']['output'];
  status: DailyTaskStatus;
  /** The set, lesson or quiz to open. The link is built from this and the kind. */
  targetId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  unitsDoneToday: Scalars['Int']['output'];
  /** Cards due, sentences left, or questions in the quiz. */
  unitsRemaining: Scalars['Int']['output'];
  /** What finishing it pays, from the same weights the counter pays from. */
  xpReward: Scalars['Int']['output'];
};

export type DailyTaskKind =
  | 'DICTATION'
  /** Cards the spaced-repetition schedule says are due. */
  | 'FLASHCARD_REVIEW'
  | 'QUIZ'
  | 'SPEAKING'
  | 'WRITING';

/**
 * There is deliberately no LOCKED. Nothing gates one piece of content behind
 * another, so UPCOMING says "not started" rather than "you may not".
 */
export type DailyTaskStatus =
  | 'COMPLETED'
  | 'CURRENT'
  | 'UPCOMING';

export type DictationDailyAccuracy = {
  __typename?: 'DictationDailyAccuracy';
  accuracyPercent: Scalars['Int']['output'];
  attemptCount: Scalars['Int']['output'];
  day: Scalars['Date']['output'];
};

export type DictationDifficultSentence = {
  __typename?: 'DictationDifficultSentence';
  accuracyPercent: Scalars['Int']['output'];
  attemptCount: Scalars['Int']['output'];
  sentenceId: Scalars['ID']['output'];
  text: Scalars['String']['output'];
  topic: Scalars['String']['output'];
};

export type DictationLesson = {
  __typename?: 'DictationLesson';
  /** Per learner: sentences whose best attempt cleared the completion threshold. */
  completedSentenceCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lastPractisedAt?: Maybe<Scalars['DateTime']['output']>;
  sentenceCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  targetLevel?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  topic: Scalars['String']['output'];
  totalDurationSeconds: Scalars['Int']['output'];
};

export type DictationLessonDetail = {
  __typename?: 'DictationLessonDetail';
  lesson: DictationLesson;
  sentences: Array<DictationSentence>;
};

export type DictationLessonPage = {
  __typename?: 'DictationLessonPage';
  items: Array<DictationLesson>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type DictationMissedWord = {
  __typename?: 'DictationMissedWord';
  accuracyPercent: Scalars['Int']['output'];
  correctCount: Scalars['Int']['output'];
  missedCount: Scalars['Int']['output'];
  word: Scalars['String']['output'];
};

/**
 * A sentence as the learner practises it. There is no transcript on this type
 * at all - the answer is a different shape entirely, produced only once they
 * have committed one of their own.
 */
export type DictationSentence = {
  __typename?: 'DictationSentence';
  audioDurationSeconds: Scalars['Int']['output'];
  audioEndMs?: Maybe<Scalars['Int']['output']>;
  /**
   * Where this sentence begins inside audioUrl, for a lesson cut from one long
   * recording. Null on both means the file is this sentence and nothing else,
   * which is what a lesson with a clip per line has always meant - so a player
   * that ignores them keeps working on older content.
   */
  audioStartMs?: Maybe<Scalars['Int']['output']>;
  /** Pre-signed and short-lived. */
  audioUrl: Scalars['String']['output'];
  /** The learner's best attempt on this line so far. Null if never tried. */
  bestAccuracyPercent?: Maybe<Scalars['Float']['output']>;
  hintFirstLetters?: Maybe<Scalars['String']['output']>;
  hintPartialTranscript?: Maybe<Scalars['String']['output']>;
  hintRevealWord?: Maybe<Scalars['String']['output']>;
  /** Counted by the same scorer that marks the answer, so the two agree. */
  hintWordCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  orderNo: Scalars['Int']['output'];
};

export type DictationSessionSummary = {
  __typename?: 'DictationSessionSummary';
  accuracyPercent: Scalars['Int']['output'];
  day: Scalars['Date']['output'];
  lessonId: Scalars['ID']['output'];
  lessonTitle: Scalars['String']['output'];
  listeningSeconds: Scalars['Int']['output'];
  sentenceCount: Scalars['Int']['output'];
};

export type DictationStats = {
  __typename?: 'DictationStats';
  activity: Array<DictationDailyAccuracy>;
  averageAccuracyPercent: Scalars['Int']['output'];
  difficultSentences: Array<DictationDifficultSentence>;
  history: Array<DictationSessionSummary>;
  lessonsCompleted: Scalars['Int']['output'];
  listeningSeconds: Scalars['Int']['output'];
  /**
   * Recomputed from recent answers rather than stored - ordered by accuracy, so
   * a word missed twice out of two ranks above one missed three times in thirty.
   */
  missedWords: Array<DictationMissedWord>;
  periodDays: Scalars['Int']['output'];
  sentencesPractised: Scalars['Int']['output'];
  streakDays: Scalars['Int']['output'];
};

/** The only type that carries the transcript. */
export type DictationSubmission = {
  __typename?: 'DictationSubmission';
  accuracyPercent: Scalars['Float']['output'];
  /**
   * Whether the line now counts as done, by the server's one rule. Sent so no
   * screen compares the accuracy to a threshold of its own.
   */
  cleared: Scalars['Boolean']['output'];
  correctText: Scalars['String']['output'];
  correctWordCount: Scalars['Int']['output'];
  response: Scalars['String']['output'];
  sentenceId: Scalars['ID']['output'];
  totalWordCount: Scalars['Int']['output'];
  translationVi?: Maybe<Scalars['String']['output']>;
};

/** The full paper shell returned by create, update, publish and archive. */
export type Exam = {
  __typename?: 'Exam';
  certificateType?: Maybe<CertificateType>;
  certificateVariant?: Maybe<CertificateVariant>;
  createdByUserId: Scalars['ID']['output'];
  description: Scalars['String']['output'];
  durationSeconds: Scalars['Int']['output'];
  examType: ExamType;
  id: Scalars['ID']['output'];
  maxRawScore: Scalars['Float']['output'];
  passScore?: Maybe<Scalars['Float']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewNote?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedByUserId?: Maybe<Scalars['ID']['output']>;
  status: ExamStatus;
  submittedForReviewAt?: Maybe<Scalars['DateTime']['output']>;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars['String']['output'];
  versionNumber: Scalars['Int']['output'];
};

export type ExamAttempt = {
  __typename?: 'ExamAttempt';
  correctAnswerCount?: Maybe<Scalars['Int']['output']>;
  examId: Scalars['ID']['output'];
  /** Null except on a history row - a sitting knows its own paper's name. */
  examTitle?: Maybe<Scalars['String']['output']>;
  /**
   * The deadline the backend issued. This is the only authority on remaining
   * time - a countdown from durationSeconds drifts across a sleeping laptop.
   */
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  maxRawScore: Scalars['Float']['output'];
  questionCount: Scalars['Int']['output'];
  /** Empty while the attempt is IN_PROGRESS - it carries the answer key. */
  questions: Array<AttemptQuestionReview>;
  /** Null until the attempt is scored. */
  rawScore?: Maybe<Scalars['Float']['output']>;
  /** True when the backend handed back an attempt that was already open. */
  resumed: Scalars['Boolean']['output'];
  scorePercentage?: Maybe<Scalars['Float']['output']>;
  scoredAt?: Maybe<Scalars['DateTime']['output']>;
  startedAt: Scalars['DateTime']['output'];
  status: ExamAttemptStatus;
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ExamAttemptPage = {
  __typename?: 'ExamAttemptPage';
  items: Array<ExamAttempt>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type ExamAttemptStatus =
  | 'EXPIRED'
  | 'IN_PROGRESS'
  | 'SCORED';

export type ExamDraft = {
  __typename?: 'ExamDraft';
  answers: Array<ExamDraftAnswer>;
  savedAt: Scalars['DateTime']['output'];
  version: Scalars['Int']['output'];
};

export type ExamDraftAnswer = {
  __typename?: 'ExamDraftAnswer';
  questionId: Scalars['ID']['output'];
  selectedOptionIds: Array<Scalars['ID']['output']>;
};

export type ExamListItem = {
  __typename?: 'ExamListItem';
  /**
   * Null on a paper with no certificate (e.g. a PLACEMENT exam) - the backend
   * allows that combination, so this cannot be non-null.
   */
  certificateType?: Maybe<CertificateType>;
  certificateVariant?: Maybe<CertificateVariant>;
  createdAt: Scalars['DateTime']['output'];
  createdByUserId: Scalars['ID']['output'];
  examType: ExamType;
  id: Scalars['ID']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Why the paper came back, in the reviewer words. On the list rather than only
   * on the detail screen: this is where an author finds out and what to change.
   */
  reviewNote?: Maybe<Scalars['String']['output']>;
  status: ExamStatus;
  submittedForReviewAt?: Maybe<Scalars['DateTime']['output']>;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars['String']['output'];
  versionNumber: Scalars['Int']['output'];
};

export type ExamPage = {
  __typename?: 'ExamPage';
  items: Array<ExamListItem>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type ExamPaper = {
  __typename?: 'ExamPaper';
  certificateType?: Maybe<CertificateType>;
  certificateVariant?: Maybe<CertificateVariant>;
  description: Scalars['String']['output'];
  durationSeconds: Scalars['Int']['output'];
  examType: ExamType;
  id: Scalars['ID']['output'];
  maxRawScore: Scalars['Float']['output'];
  passScore?: Maybe<Scalars['Float']['output']>;
  sections: Array<ExamSectionDetail>;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars['String']['output'];
  versionNumber: Scalars['Int']['output'];
};

export type ExamQuestion = {
  __typename?: 'ExamQuestion';
  content: Scalars['String']['output'];
  difficultyLevel: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  maxRawScore: Scalars['Float']['output'];
  options: Array<QuestionOption>;
  orderNo: Scalars['Int']['output'];
  questionCategory?: Maybe<Scalars['String']['output']>;
  questionType: Scalars['String']['output'];
  skillType: Scalars['String']['output'];
};

export type ExamQuestionSet = {
  __typename?: 'ExamQuestionSet';
  /** Pre-signed and short-lived - the backend resolves the object key for us. */
  audioUrl?: Maybe<Scalars['String']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  instruction?: Maybe<Scalars['String']['output']>;
  orderNo: Scalars['Int']['output'];
  questions: Array<ExamQuestion>;
  title?: Maybe<Scalars['String']['output']>;
};

export type ExamSectionDetail = {
  __typename?: 'ExamSectionDetail';
  id: Scalars['ID']['output'];
  maxRawScore: Scalars['Float']['output'];
  orderNo: Scalars['Int']['output'];
  parts: Array<ExamSectionPart>;
  scoredByCriteria: Scalars['Boolean']['output'];
  sectionType: Scalars['String']['output'];
  timeLimitSeconds?: Maybe<Scalars['Int']['output']>;
};

export type ExamSectionPart = {
  __typename?: 'ExamSectionPart';
  audioUrl?: Maybe<Scalars['String']['output']>;
  content?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  instruction?: Maybe<Scalars['String']['output']>;
  orderNo: Scalars['Int']['output'];
  questionSets: Array<ExamQuestionSet>;
  title: Scalars['String']['output'];
};

/**
 * DRAFT -> PENDING_REVIEW -> PUBLISHED, with REJECTED as the way back. There is
 * no locked-style dead end: a rejected paper is editable, or its author could
 * never answer the note.
 */
export type ExamStatus =
  | 'ARCHIVED'
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED';

export type ExamType =
  | 'MOCK'
  | 'PLACEMENT';

export type Flashcard = {
  __typename?: 'Flashcard';
  audioUkUrl?: Maybe<Scalars['String']['output']>;
  /** Pre-signed and short-lived - the backend resolves the object key. */
  audioUsUrl?: Maybe<Scalars['String']['output']>;
  cefrLevel?: Maybe<Scalars['String']['output']>;
  definitionEn: Scalars['String']['output'];
  definitionVi: Scalars['String']['output'];
  /** Null for a card the learner has never answered. */
  dueAt?: Maybe<Scalars['DateTime']['output']>;
  exampleSentence: Scalars['String']['output'];
  exampleTranslationVi?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ipaUk?: Maybe<Scalars['String']['output']>;
  ipaUs: Scalars['String']['output'];
  lapseCount: Scalars['Int']['output'];
  lemma: Scalars['String']['output'];
  mnemonicTipVi?: Maybe<Scalars['String']['output']>;
  orderNo: Scalars['Int']['output'];
  partOfSpeech: Scalars['String']['output'];
  /** Which sense the card teaches - "bank (river)" is not "bank (money)". */
  senseLabel: Scalars['String']['output'];
  status: FlashcardReviewStatus;
};

export type FlashcardDailyActivity = {
  __typename?: 'FlashcardDailyActivity';
  cardCount: Scalars['Int']['output'];
  day: Scalars['Date']['output'];
};

export type FlashcardDifficultCard = {
  __typename?: 'FlashcardDifficultCard';
  flashcardId: Scalars['ID']['output'];
  /**
   * Times the card was lost after having been learned. Not the same as times
   * failed: failing a card still being learned is ordinary progress.
   */
  lapseCount: Scalars['Int']['output'];
  lastReviewed?: Maybe<Scalars['DateTime']['output']>;
  lemma: Scalars['String']['output'];
  setName: Scalars['String']['output'];
};

export type FlashcardReview = {
  __typename?: 'FlashcardReview';
  dueAt: Scalars['DateTime']['output'];
  flashcardId: Scalars['ID']['output'];
  intervalDays: Scalars['Int']['output'];
  lapseCount: Scalars['Int']['output'];
  repetitions: Scalars['Int']['output'];
  status: FlashcardReviewStatus;
};

export type FlashcardReviewStatus =
  | 'LEARNING'
  | 'MASTERED'
  | 'NEW'
  | 'REVIEW';

export type FlashcardSessionSummary = {
  __typename?: 'FlashcardSessionSummary';
  cardCount: Scalars['Int']['output'];
  day: Scalars['Date']['output'];
  recallPercent: Scalars['Int']['output'];
  setId: Scalars['ID']['output'];
  setName: Scalars['String']['output'];
  studySeconds: Scalars['Int']['output'];
};

export type FlashcardSet = {
  __typename?: 'FlashcardSet';
  cardCount: Scalars['Int']['output'];
  description: Scalars['String']['output'];
  /**
   * Per learner, not per set: two learners looking at the same set see
   * different numbers, which is why these are not fields of the set itself.
   */
  dueCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  /** Null until the learner has answered a card in this set. */
  lastStudiedAt?: Maybe<Scalars['DateTime']['output']>;
  masteredCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  /** Null on a set that deliberately mixes levels. */
  targetLevel?: Maybe<Scalars['String']['output']>;
  topic: Scalars['String']['output'];
};

export type FlashcardSetDetail = {
  __typename?: 'FlashcardSetDetail';
  cards: Array<Flashcard>;
  set: FlashcardSet;
};

export type FlashcardSetPage = {
  __typename?: 'FlashcardSetPage';
  items: Array<FlashcardSet>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type FlashcardStats = {
  __typename?: 'FlashcardStats';
  activity: Array<FlashcardDailyActivity>;
  cardsStudied: Scalars['Int']['output'];
  difficultCards: Array<FlashcardDifficultCard>;
  history: Array<FlashcardSessionSummary>;
  periodDays: Scalars['Int']['output'];
  retentionPercent: Scalars['Int']['output'];
  /** Counted over a year, not the period - a 7-day view still shows a 40-day streak. */
  streakDays: Scalars['Int']['output'];
  studySeconds: Scalars['Int']['output'];
};

export type Gender =
  | 'FEMALE'
  | 'MALE'
  | 'OTHER';

export type LearnerAttemptStatus =
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'NOT_STARTED';

export type LearnerExamItem = {
  __typename?: 'LearnerExamItem';
  attemptStatus: LearnerAttemptStatus;
  /** Per learner. Null until they have finished a sitting. */
  bestScorePercentage?: Maybe<Scalars['Float']['output']>;
  certificateType?: Maybe<CertificateType>;
  certificateVariant?: Maybe<CertificateVariant>;
  description: Scalars['String']['output'];
  durationSeconds: Scalars['Int']['output'];
  examType: ExamType;
  id: Scalars['ID']['output'];
  maxRawScore: Scalars['Float']['output'];
  passScore?: Maybe<Scalars['Float']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  questionCount: Scalars['Int']['output'];
  status: ExamStatus;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars['String']['output'];
};

export type LearnerExamPage = {
  __typename?: 'LearnerExamPage';
  items: Array<LearnerExamItem>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type LearningGoalInput = {
  certificateType: TargetCertificate;
  targetDate?: InputMaybe<Scalars['Date']['input']>;
  /** Only a certificate learner may send this - the backend refuses it otherwise. */
  targetScore?: InputMaybe<Scalars['Float']['input']>;
};

export type LearningPurpose = {
  __typename?: 'LearningPurpose';
  displayName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  purposeCode: Scalars['String']['output'];
};

export type LearningSkill =
  | 'GRAMMAR'
  | 'LISTENING'
  | 'PRONUNCIATION'
  | 'READING'
  | 'SPEAKING'
  | 'VOCABULARY'
  | 'WRITING';

export type Me = {
  __typename?: 'Me';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bannerUrl?: Maybe<Scalars['String']['output']>;
  birthDate?: Maybe<Scalars['Date']['output']>;
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  gender?: Maybe<Gender>;
  id: Scalars['ID']['output'];
  onboardingState?: Maybe<OnboardingState>;
  onboardingStep: OnboardingStep;
  role: Role;
};

/**
 * One line to practise again.
 *
 * No transcript, like DictationSentence. It used to carry one - every row is a
 * line the learner has already answered - but the screen then graded in the
 * browser and never told the server, so reviewed lines were never recorded and
 * came back on the next visit. Review now submits like practice does, and the
 * answer arrives in that response, after one has been committed.
 */
export type MistakeSentence = {
  __typename?: 'MistakeSentence';
  attemptCount: Scalars['Int']['output'];
  audioDurationSeconds: Scalars['Int']['output'];
  audioEndMs?: Maybe<Scalars['Int']['output']>;
  /** Where the line sits inside audioUrl, for a lesson cut from one passage. */
  audioStartMs?: Maybe<Scalars['Int']['output']>;
  /** Pre-signed and short-lived. */
  audioUrl: Scalars['String']['output'];
  /** Their best attempt so far - the reason this line is still in the queue. */
  bestAccuracyPercent: Scalars['Int']['output'];
  /** The last thing they typed, so the screen can show what changed. */
  lastResponse?: Maybe<Scalars['String']['output']>;
  lessonId: Scalars['ID']['output'];
  lessonTitle: Scalars['String']['output'];
  sentenceId: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['Boolean']['output']>;
  /**
   * PENDING_REVIEW -> PUBLISHED, administrators only. Approving publishes in the
   * same step - there is no approved-but-unpublished state.
   */
  approveContent: ContentReview;
  /**
   * PENDING_REVIEW -> PUBLISHED, administrators only. Approving publishes in
   * the same step - there is no approved-but-unpublished state.
   */
  approveExam: Exam;
  /** Anything -> ARCHIVED. Administrators only. There is no delete. */
  archiveContent: ContentReview;
  /**
   * DRAFT or PUBLISHED -> ARCHIVED. There is no delete; archiving is the
   * retirement path. Archiving an already-archived paper fails with
   * extensions.backendCode: EXAM_ALREADY_ARCHIVED.
   */
  archiveExam: Exam;
  archiveTutorConversation: TutorConversationSummary;
  completeMyTour: UserTourStatus;
  /**
   * Final step. Refuses with ONBOARDING_PURPOSE_REQUIRED,
   * ONBOARDING_LEVEL_REQUIRED or ONBOARDING_CERTIFICATE_TARGET_REQUIRED when an
   * earlier step is missing.
   */
  completeOnboarding: OnboardingState;
  createAssessmentTask: AssessmentTask;
  editAssessmentTask: AssessmentTask;
  gradeAssessment: AssessmentAttempt;
  /** DRAFT -> PUBLISHED, skipping review. Administrators only. */
  publishContent: ContentReview;
  /**
   * DRAFT -> PUBLISHED. The backend refuses a paper that is not a draft, has
   * no section or question, whose section scores do not total maxRawScore, or
   * that has an ungradeable question - the reason arrives as
   * extensions.backendCode on the error (e.g. EXAM_SCORE_MISMATCH).
   */
  publishExam: Exam;
  /**
   * Records one answer and returns where the card now sits. Creates the review
   * row on first sight, so browsing a set costs nothing until it is studied.
   */
  rateFlashcard: FlashcardReview;
  readAssessmentResult: Scalars['Boolean']['output'];
  /**
   * PENDING_REVIEW -> REJECTED, administrators only. The note is required: the
   * backend refuses a blank one with REVIEW_NOTE_REQUIRED, because "rejected"
   * alone leaves the author nothing to change.
   */
  rejectContent: ContentReview;
  /**
   * PENDING_REVIEW -> REJECTED, administrators only. The note is required: the
   * backend refuses a blank one with EXAM_REVIEW_NOTE_REQUIRED, because
   * "rejected" alone leaves the author nothing to change.
   */
  rejectExam: Exam;
  /** Reports an answer as wrong or inappropriate. The note is optional. */
  reportTutorMessage: TutorMessage;
  requestAssessmentReview: AssessmentAttempt;
  /**
   * ARCHIVED -> back where it was: PUBLISHED if it had been published (it is
   * never edited, so it needs no second review), DRAFT otherwise.
   * Administrators only. Anything not archived fails with
   * extensions.backendCode: <KIND>_NOT_ARCHIVED.
   */
  restoreContent: ContentReview;
  /**
   * ARCHIVED -> PUBLISHED if the paper had been published, DRAFT otherwise.
   * Administrators only; anything not archived fails with
   * extensions.backendCode: EXAM_NOT_ARCHIVED.
   */
  restoreExam: Exam;
  retryAssessment: AssessmentAttempt;
  saveAssessmentDraft: AssessmentAttempt;
  saveExamDraft: ExamDraft;
  /**
   * Records the purposes and advances the step. Which step comes next is the
   * backend's decision: a learner who picked the certificate purpose goes to
   * CERTIFICATE_TARGET, everyone else skips straight to CURRENT_LEVEL. Read the
   * new step from the result's step rather than assuming either branch.
   */
  selectLearningPurposes: OnboardingState;
  /**
   * An empty list means "I don't know yet" and is allowed. This does not
   * advance the step - the backend leaves the learner on TARGET_SKILLS until
   * completeOnboarding is called.
   */
  selectTargetSkills: OnboardingState;
  /**
   * Sends a question. Omit conversationId to start a new thread - whether one
   * already exists is not the learner's concern.
   */
  sendTutorMessage: TutorConversation;
  /**
   * Only valid for a certificate learner - the backend answers
   * extensions.backendCode: CERTIFICATE_TARGET_NOT_APPLICABLE for anyone else.
   */
  setCertificateTarget: OnboardingState;
  /**
   * Non-null on purpose: the backend accepts a null level only to route the
   * learner into a placement test or levelling quiz, and neither exists yet, so
   * it answers PLACEMENT_NOT_AVAILABLE / QUIZ_NOT_AVAILABLE. Offering the field
   * as nullable here would advertise a path that always fails.
   */
  setCurrentLevel: OnboardingState;
  /** Refuses with ONBOARDING_LEVEL_REQUIRED until the level step is done. */
  setLearningGoal: OnboardingState;
  startAssessment: AssessmentUpload;
  /**
   * Opens an attempt, or returns the one already open with resumed: true. The
   * backend enforces one live attempt per learner and exam, so calling this
   * twice does not create two.
   */
  startExamAttempt: ExamAttempt;
  /**
   * Opens an attempt, or returns the one already open with resumed: true. The
   * backend enforces one live attempt per learner and quiz.
   */
  startQuizAttempt: QuizAttempt;
  /**
   * Opens an attempt and returns somewhere to PUT the recording. The format is
   * checked now rather than at assessment time, so an unusable one is refused
   * before the learner records anything.
   */
  startSpeakingAttempt: SpeakingUploadTicket;
  submitAssessment: AssessmentAttempt;
  /**
   * DRAFT or REJECTED -> PENDING_REVIEW. Staff as well as administrators. Held
   * to the publication rules at this end too, so a reviewer is never handed an
   * empty set: the refusal arrives as extensions.backendCode.
   */
  submitContentForReview: ContentReview;
  /**
   * Marks one transcription and returns the correct text with it. An empty
   * answer is a real answer - it scores zero rather than being rejected.
   */
  submitDictation: DictationSubmission;
  /**
   * Submits and scores in one step. The backend rejects a submission after
   * expiresAt, which is why the client must never decide expiry itself.
   */
  submitExamAttempt: ExamAttempt;
  /**
   * DRAFT or REJECTED -> PENDING_REVIEW. Staff as well as administrators may
   * call it. Held to the publication rules at this end too, so a reviewer is
   * never handed a paper with no questions: the refusal arrives as
   * extensions.backendCode (e.g. EXAM_HAS_NO_QUESTION).
   */
  submitExamForReview: Exam;
  /**
   * Submits and scores in one step. A question left out is marked wrong rather
   * than skipped, so the percentage means what it says.
   */
  submitQuizAttempt: QuizAttempt;
  /**
   * The upload is done; queue the assessment. Refused with
   * extensions.backendCode SPEAKING_RECORDING_MISSING if the recording is not
   * actually in storage.
   */
  submitSpeakingAttempt: SpeakingAttempt;
  transitionAssessmentTask: AssessmentTask;
  updateProfile: Me;
};


export type MutationApproveContentArgs = {
  id: Scalars['ID']['input'];
  kind: ContentKind;
};


export type MutationApproveExamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveContentArgs = {
  id: Scalars['ID']['input'];
  kind: ContentKind;
};


export type MutationArchiveExamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveTutorConversationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateAssessmentTaskArgs = {
  input: AssessmentTaskInput;
};


export type MutationEditAssessmentTaskArgs = {
  id: Scalars['ID']['input'];
  input: AssessmentTaskInput;
  version: Scalars['Int']['input'];
};


export type MutationGradeAssessmentArgs = {
  id: Scalars['ID']['input'];
  note: Scalars['String']['input'];
  report: Scalars['String']['input'];
  transcript?: InputMaybe<Scalars['String']['input']>;
  version: Scalars['Int']['input'];
};


export type MutationPublishContentArgs = {
  id: Scalars['ID']['input'];
  kind: ContentKind;
};


export type MutationPublishExamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRateFlashcardArgs = {
  flashcardId: Scalars['ID']['input'];
  rating: ReviewRating;
  timeSpentSeconds: Scalars['Int']['input'];
};


export type MutationReadAssessmentResultArgs = {
  id: Scalars['ID']['input'];
  version: Scalars['Int']['input'];
};


export type MutationRejectContentArgs = {
  id: Scalars['ID']['input'];
  kind: ContentKind;
  note: Scalars['String']['input'];
};


export type MutationRejectExamArgs = {
  id: Scalars['ID']['input'];
  note: Scalars['String']['input'];
};


export type MutationReportTutorMessageArgs = {
  conversationId: Scalars['ID']['input'];
  messageId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRequestAssessmentReviewArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRestoreContentArgs = {
  id: Scalars['ID']['input'];
  kind: ContentKind;
};


export type MutationRestoreExamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRetryAssessmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSaveAssessmentDraftArgs = {
  answerText: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  version: Scalars['Int']['input'];
};


export type MutationSaveExamDraftArgs = {
  answers: Array<SubmitAnswerInput>;
  attemptId: Scalars['ID']['input'];
  version: Scalars['Int']['input'];
};


export type MutationSelectLearningPurposesArgs = {
  purposeIds: Array<Scalars['Int']['input']>;
};


export type MutationSelectTargetSkillsArgs = {
  skills: Array<LearningSkill>;
};


export type MutationSendTutorMessageArgs = {
  conversationId?: InputMaybe<Scalars['ID']['input']>;
  message: Scalars['String']['input'];
  topic?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetCertificateTargetArgs = {
  certificateType: TargetCertificate;
};


export type MutationSetCurrentLevelArgs = {
  level: CefrLevel;
};


export type MutationSetLearningGoalArgs = {
  input: LearningGoalInput;
};


export type MutationStartAssessmentArgs = {
  clientKey: Scalars['ID']['input'];
  contentLength?: InputMaybe<Scalars['Int']['input']>;
  contentType?: InputMaybe<Scalars['String']['input']>;
  taskId: Scalars['ID']['input'];
};


export type MutationStartExamAttemptArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationStartQuizAttemptArgs = {
  quizId: Scalars['ID']['input'];
};


export type MutationStartSpeakingAttemptArgs = {
  contentLength: Scalars['Int']['input'];
  contentType: Scalars['String']['input'];
  promptId: Scalars['ID']['input'];
};


export type MutationSubmitAssessmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSubmitContentForReviewArgs = {
  id: Scalars['ID']['input'];
  kind: ContentKind;
};


export type MutationSubmitDictationArgs = {
  response: Scalars['String']['input'];
  sentenceId: Scalars['ID']['input'];
};


export type MutationSubmitExamAttemptArgs = {
  answers: Array<SubmitAnswerInput>;
  attemptId: Scalars['ID']['input'];
};


export type MutationSubmitExamForReviewArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSubmitQuizAttemptArgs = {
  answers: Array<QuizAnswerInput>;
  attemptId: Scalars['ID']['input'];
};


export type MutationSubmitSpeakingAttemptArgs = {
  attemptId: Scalars['ID']['input'];
};


export type MutationTransitionAssessmentTaskArgs = {
  action: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type OnboardingState = {
  __typename?: 'OnboardingState';
  certificateLearner: Scalars['Boolean']['output'];
  currentLevel?: Maybe<CefrLevel>;
  learningPurposeIds: Array<Scalars['Int']['output']>;
  /**
   * The step after this write. Every onboarding write answers with it, so the
   * client can move to the next screen without reading Me again.
   */
  step: OnboardingStep;
  targetCertificateType?: Maybe<Scalars['String']['output']>;
  targetDate?: Maybe<Scalars['Date']['output']>;
  targetScore?: Maybe<Scalars['Float']['output']>;
  targetSkills: Array<LearningSkill>;
};

export type OnboardingStep =
  | 'CERTIFICATE_TARGET'
  | 'COMPLETED'
  | 'CURRENT_LEVEL'
  | 'LEARNING_GOAL'
  | 'LEARNING_PURPOSES'
  | 'TARGET_SKILLS';

export type OverviewContentCounts = {
  __typename?: 'OverviewContentCounts';
  drafts: Scalars['Int']['output'];
  kind: OverviewContentKind;
  pendingReview: Scalars['Int']['output'];
  published: Scalars['Int']['output'];
};

/** Everything the overview counts: the four kinds of authored content, and exams. */
export type OverviewContentKind =
  | 'DICTATION_LESSON'
  | 'EXAM'
  | 'FLASHCARD_SET'
  | 'QUIZ'
  | 'SPEAKING_ASSESSMENT'
  | 'SPEAKING_PROMPT'
  | 'WRITING_ASSESSMENT';

export type Query = {
  __typename?: 'Query';
  /**
   * The authoring list for one kind of content, at every status. Omitting
   * status asks for all of them, so this serves both the full list and the
   * review queue. Staff and administrators only - the backend answers 403 to
   * anyone else.
   */
  adminContent: ContentReviewPage;
  /**
   * Admin catalogue search - returns drafts and archived papers too, so the
   * backend restricts it to ADMIN. Sorted newest first by the backend.
   */
  adminExams: ExamPage;
  /** Staff and administrators only. */
  adminOverview: AdminOverview;
  assessmentAttempt: AssessmentAttempt;
  assessmentCapabilities: AssessmentCapabilities;
  assessmentHistory: AssessmentAttemptPage;
  assessmentNotifications: AssessmentNotificationPage;
  assessmentReviews: Array<AssessmentReview>;
  assessmentSubmission: AssessmentAttempt;
  assessmentSubmissions: AssessmentSubmissionPage;
  assessmentTask: AssessmentTask;
  assessmentTasks: AssessmentTaskPage;
  assessmentWorkload: AssessmentWorkload;
  /**
   * The paper to sit, reachable only through an open attempt. There is no
   * lookup by exam id: the answer key is stripped per attempt, and handing out
   * a paper without one would mean handing it out unscoped.
   */
  attemptPaper: ExamPaper;
  authoringAssessmentTask: AssessmentTask;
  authoringAssessmentTasks: AssessmentTaskPage;
  /**
   * The learner's own plan for today: streak, points, roadmap and goals. Takes
   * no argument because the only path anyone can read is their own.
   */
  dailyPath: DailyPath;
  dictationLesson: DictationLessonDetail;
  dictationLessons: DictationLessonPage;
  /**
   * Lines this learner keeps getting wrong, worst first, across every lesson.
   * Not per lesson: "what do I keep getting wrong" is a question about the
   * learner, and the worst ten in one lesson are usually not the ten worth
   * practising.
   */
  dictationMistakes: Array<MistakeSentence>;
  dictationStats: DictationStats;
  /** Learner exam detail by id */
  exam?: Maybe<LearnerExamItem>;
  /**
   * The scored attempt. Carries the answer key, so it is only worth reading
   * once the attempt has left IN_PROGRESS.
   */
  examAttempt: ExamAttempt;
  /**
   * The learner's own sittings, newest first. Rows carry no review - that
   * structure holds the answer key.
   */
  examAttempts: ExamAttemptPage;
  examDraft: ExamDraft;
  /** Learner exam catalogue search - returns published exams. */
  exams: LearnerExamPage;
  flashcardSet: FlashcardSetDetail;
  flashcardSets: FlashcardSetPage;
  /**
   * Everything the statistics screen shows, in one call. Six round trips to
   * draw one page is the problem a BFF exists to avoid.
   */
  flashcardStats: FlashcardStats;
  /**
   * What to study now: cards that are due, then unseen ones to fill the
   * session. The ordering is the backend's - a card about to be forgotten is
   * worth more than a new one, and reordering here would undo the schedule.
   */
  flashcardStudyQueue: Array<Flashcard>;
  health: Scalars['String']['output'];
  learningPurposes: Array<LearningPurpose>;
  me: Me;
  myTourStatus: UserTourStatus;
  /**
   * The placement paper, for a learner who does not know their level. Errors
   * with NOT_FOUND when the deployment has no published placement exam, which
   * is a normal state rather than a fault.
   */
  placementExam: LearnerExamItem;
  /** The scored attempt. Carries the answer key, so only worth reading once scored. */
  quizAttempt: QuizAttempt;
  /** The paper to sit, reachable only through an open attempt. */
  quizPaper: QuizPaper;
  quizzes: QuizPage;
  /** What the screen polls while it waits for a score. */
  speakingAttempt: SpeakingAttempt;
  /** This learner's own attempts at one prompt, newest first. No word breakdown. */
  speakingAttempts: Array<SpeakingAttempt>;
  speakingPrompt: SpeakingPrompt;
  speakingPrompts: SpeakingPromptPage;
  tutorConversation: TutorConversation;
  tutorConversations: Array<TutorConversationSummary>;
};


export type QueryAdminContentArgs = {
  kind: ContentKind;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ContentStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminExamsArgs = {
  examType?: InputMaybe<ExamType>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ExamStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAssessmentAttemptArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAssessmentHistoryArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  skill?: InputMaybe<AssessmentSkill>;
  status?: InputMaybe<AssessmentAttemptStatus>;
  taskId?: InputMaybe<Scalars['ID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAssessmentNotificationsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAssessmentReviewsArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAssessmentSubmissionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAssessmentSubmissionsArgs = {
  oldest?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  skill?: InputMaybe<AssessmentSkill>;
  status?: InputMaybe<AssessmentAttemptStatus>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAssessmentTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAssessmentTasksArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  skill?: InputMaybe<AssessmentSkill>;
};


export type QueryAttemptPaperArgs = {
  attemptId: Scalars['ID']['input'];
};


export type QueryAuthoringAssessmentTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAuthoringAssessmentTasksArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  skill?: InputMaybe<AssessmentSkill>;
  status?: InputMaybe<AssessmentTaskStatus>;
};


export type QueryDictationLessonArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDictationLessonsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  topic?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDictationStatsArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryExamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamAttemptArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamAttemptsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryExamDraftArgs = {
  attemptId: Scalars['ID']['input'];
};


export type QueryExamsArgs = {
  certificateType?: InputMaybe<CertificateType>;
  certificateVariant?: InputMaybe<CertificateVariant>;
  examType?: InputMaybe<ExamType>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  targetLevel?: InputMaybe<TargetLevel>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFlashcardSetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFlashcardSetsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  topic?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFlashcardStatsArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryFlashcardStudyQueueArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  setId: Scalars['ID']['input'];
};


export type QueryQuizAttemptArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuizPaperArgs = {
  attemptId: Scalars['ID']['input'];
};


export type QueryQuizzesArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySpeakingAttemptArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySpeakingAttemptsArgs = {
  promptId: Scalars['ID']['input'];
};


export type QuerySpeakingPromptArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySpeakingPromptsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTutorConversationArgs = {
  id: Scalars['ID']['input'];
};

/**
 * An option as the learner sees it while sitting: no correctness flag and no
 * explanation. Both arrive afterwards on AttemptOptionReview.
 */
export type QuestionOption = {
  __typename?: 'QuestionOption';
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  orderNo: Scalars['Int']['output'];
};

export type Quiz = {
  __typename?: 'Quiz';
  attemptCount: Scalars['Int']['output'];
  /** Per learner. Null until they have finished one. */
  bestScorePercent?: Maybe<Scalars['Float']['output']>;
  category: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Percentage, so a quiz can gain a question without its pass mark shifting. */
  passingScorePercent: Scalars['Int']['output'];
  questionCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  targetLevel?: Maybe<Scalars['String']['output']>;
  timeLimitSeconds: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type QuizAnswerInput = {
  questionId: Scalars['ID']['input'];
  /**
   * What an answer means depends on the type: an option id, a typed phrase, the
   * chosen words joined by spaces, or the matched halves joined by "|".
   */
  response: Scalars['String']['input'];
};

export type QuizAttempt = {
  __typename?: 'QuizAttempt';
  correctAnswerCount?: Maybe<Scalars['Int']['output']>;
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  maxScore: Scalars['Float']['output'];
  passed?: Maybe<Scalars['Boolean']['output']>;
  questionCount: Scalars['Int']['output'];
  quizId: Scalars['ID']['output'];
  quizTitle: Scalars['String']['output'];
  /** True when the backend handed back an attempt that was already open. */
  resumed: Scalars['Boolean']['output'];
  /** Empty while the attempt is IN_PROGRESS - it carries the answer key. */
  reviews: Array<QuizQuestionReview>;
  /** Null until the attempt is scored. */
  score?: Maybe<Scalars['Float']['output']>;
  scorePercentage?: Maybe<Scalars['Float']['output']>;
  startedAt: Scalars['DateTime']['output'];
  status: QuizAttemptStatus;
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type QuizAttemptStatus =
  | 'EXPIRED'
  | 'IN_PROGRESS'
  | 'SCORED';

/**
 * An option as the learner sees it while sitting. There is no correctness flag
 * on this type at all - the answer key is a different shape entirely, so there
 * is no field here to forget to clear.
 */
export type QuizOption = {
  __typename?: 'QuizOption';
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  orderNo: Scalars['Int']['output'];
};

export type QuizPage = {
  __typename?: 'QuizPage';
  items: Array<Quiz>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type QuizPaper = {
  __typename?: 'QuizPaper';
  attemptId: Scalars['ID']['output'];
  description: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  questions: Array<QuizPaperQuestion>;
  quizId: Scalars['ID']['output'];
  timeLimitSeconds: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type QuizPaperQuestion = {
  __typename?: 'QuizPaperQuestion';
  afterText?: Maybe<Scalars['String']['output']>;
  /** FILL_BLANK renders as "<before> ___ <after>"; null on every other type. */
  beforeText?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  leftTexts: Array<Scalars['String']['output']>;
  options: Array<QuizOption>;
  orderNo: Scalars['Int']['output'];
  originalSentence?: Maybe<Scalars['String']['output']>;
  points: Scalars['Int']['output'];
  prompt: Scalars['String']['output'];
  questionType: QuizQuestionType;
  rewriteKeyword?: Maybe<Scalars['String']['output']>;
  /**
   * Shuffled by the backend, seeded from the attempt: the stored order is the
   * answer, and reloading must not deal a new puzzle.
   */
  rightTexts: Array<Scalars['String']['output']>;
  scrambledWords: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  wordBank: Array<Scalars['String']['output']>;
};

export type QuizQuestionReview = {
  __typename?: 'QuizQuestionReview';
  correct: Scalars['Boolean']['output'];
  correctAnswerText: Scalars['String']['output'];
  explanation: Scalars['String']['output'];
  pointsEarned: Scalars['Float']['output'];
  pointsPossible: Scalars['Int']['output'];
  prompt: Scalars['String']['output'];
  questionId: Scalars['ID']['output'];
  questionType: QuizQuestionType;
  userAnswerText: Scalars['String']['output'];
};

export type QuizQuestionType =
  | 'FILL_BLANK'
  | 'MATCHING'
  | 'MULTIPLE_CHOICE'
  | 'REORDER'
  | 'REWRITE';

/**
 * What the learner said about a card. SM-2 grades answers 0-5; these are the
 * four buttons the interface offers, and the backend maps them onto the
 * algorithm. Only AGAIN counts as a failure.
 */
export type ReviewRating =
  | 'AGAIN'
  | 'EASY'
  | 'GOOD'
  | 'HARD';

/**
 * What the account may do. For drawing the interface only - every gate is
 * enforced on the backend from the verified token, never from this field.
 */
export type Role =
  | 'ADMIN'
  | 'LEARNER'
  | 'STAFF';

/**
 * One recording and its score.
 *
 * Every score is nullable and stays that way. The provider omits what it did
 * not measure - prosody unless asked for, accuracy on a recording of silence -
 * so a missing measurement is shown as missing. A zero would tell a learner
 * they scored nothing when nothing was measured.
 */
export type SpeakingAttempt = {
  __typename?: 'SpeakingAttempt';
  accuracyPercent?: Maybe<Scalars['Float']['output']>;
  assessedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Pre-signed and short-lived. */
  audioUrl: Scalars['String']['output'];
  completenessPercent?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  /** Why no score will arrive, when none will. */
  errorCode?: Maybe<Scalars['String']['output']>;
  fluencyPercent?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  promptTitle: Scalars['String']['output'];
  pronunciationPercent?: Maybe<Scalars['Float']['output']>;
  prosodyPercent?: Maybe<Scalars['Float']['output']>;
  /** What the provider heard. Null until assessed. */
  recognizedText?: Maybe<Scalars['String']['output']>;
  referenceText: Scalars['String']['output'];
  speakingPromptId: Scalars['ID']['output'];
  status: SpeakingAttemptStatus;
  /** Empty while the assessment is still queued. */
  words: Array<SpeakingWord>;
};

/**
 * Where one recording stands. There is no RUNNING: whether a worker currently
 * has the job in hand is the queue's business, and QUEUED is all a learner
 * watching a spinner needs to know.
 */
export type SpeakingAttemptStatus =
  | 'ASSESSED'
  | 'AWAITING_UPLOAD'
  | 'FAILED'
  | 'QUEUED';

export type SpeakingPhonemeScore = {
  __typename?: 'SpeakingPhonemeScore';
  accuracy?: Maybe<Scalars['Float']['output']>;
  phoneme: Scalars['String']['output'];
};

export type SpeakingPrompt = {
  __typename?: 'SpeakingPrompt';
  /** Per learner. Null until they have finished one. */
  bestScorePercent?: Maybe<Scalars['Float']['output']>;
  category: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ipaTranscript?: Maybe<Scalars['String']['output']>;
  /** The sound being drilled, e.g. "/iː/ vs /ɪ/". */
  phonemeTarget?: Maybe<Scalars['String']['output']>;
  /** What the learner is asked to say. The accuracy score is accuracy against this. */
  referenceText: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  targetLevel?: Maybe<Scalars['String']['output']>;
  tips: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  translationVi?: Maybe<Scalars['String']['output']>;
};

export type SpeakingPromptPage = {
  __typename?: 'SpeakingPromptPage';
  items: Array<SpeakingPrompt>;
  page: Scalars['Int']['output'];
  size: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

/** Where to put a recording, and for how long that offer stands. */
export type SpeakingUploadTicket = {
  __typename?: 'SpeakingUploadTicket';
  attemptId: Scalars['ID']['output'];
  contentType: Scalars['String']['output'];
  /** Told to the client so it can say "start again" rather than failing on an expired URL. */
  expiresInSeconds: Scalars['Int']['output'];
  /**
   * A presigned PUT straight to object storage. The browser uploads there, not
   * through this BFF: a minute of audio through a request thread costs a thread
   * for a minute and lands in the same bucket either way.
   */
  uploadUrl: Scalars['String']['output'];
};

export type SpeakingWord = {
  __typename?: 'SpeakingWord';
  accuracyPercent?: Maybe<Scalars['Float']['output']>;
  durationMs?: Maybe<Scalars['Int']['output']>;
  /** The provider's own label: Mispronunciation, Omission, Insertion, None. */
  errorType?: Maybe<Scalars['String']['output']>;
  offsetMs?: Maybe<Scalars['Int']['output']>;
  orderNo: Scalars['Int']['output'];
  phonemes: Array<SpeakingPhonemeScore>;
  word: Scalars['String']['output'];
};

export type SubmitAnswerInput = {
  questionId: Scalars['ID']['input'];
  /** Empty for a question the learner skipped; several for a multi-select. */
  selectedOptionIds: Array<Scalars['ID']['input']>;
};

/**
 * The certificate a learner aims at. Deliberately not the exam module's
 * CertificateType: that one describes a paper, this one describes a learner's
 * goal, and the backend keeps user.entity.CertificateType apart from
 * exam.entity.CertificateType for the same reason.
 */
export type TargetCertificate =
  | 'IELTS'
  | 'TOEIC';

/**
 * CEFR band a paper is aimed at. Separate from CefrLevel, which is a learner's
 * own level - the backend keeps the two enums apart for the same reason.
 */
export type TargetLevel =
  | 'A1'
  | 'A2'
  | 'B1'
  | 'B2'
  | 'C1'
  | 'C2';

export type TutorConversation = {
  __typename?: 'TutorConversation';
  conversation: TutorConversationSummary;
  messages: Array<TutorMessage>;
};

export type TutorConversationSummary = {
  __typename?: 'TutorConversationSummary';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lastMessageAt: Scalars['DateTime']['output'];
  messageCount: Scalars['Int']['output'];
  /** Taken from the first thing the learner said, so the list reads as what they asked. */
  title: Scalars['String']['output'];
  topic?: Maybe<Scalars['String']['output']>;
};

export type TutorMessage = {
  __typename?: 'TutorMessage';
  answeredAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Null while a reply is pending. Nullable on purpose: a screen has to tell
   * "still thinking" from "answered with nothing", and an empty string for both
   * would make that impossible.
   */
  content?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  /** Why no answer came, when none did. */
  errorCode?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  model?: Maybe<Scalars['String']['output']>;
  orderNo: Scalars['Int']['output'];
  reported: Scalars['Boolean']['output'];
  role: TutorMessageRole;
  status: TutorMessageStatus;
};

export type TutorMessageRole =
  | 'ASSISTANT'
  | 'USER';

/**
 * Whether a turn has something to show yet. Only the tutor's side is ever
 * PENDING; the learner's own message is READY the moment it arrives.
 */
export type TutorMessageStatus =
  | 'FAILED'
  | 'PENDING'
  | 'READY';

export type UpdateProfileInput = {
  birthDate?: InputMaybe<Scalars['Date']['input']>;
  displayName: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  gender?: InputMaybe<Gender>;
};

export type UserTourStatus = {
  __typename?: 'UserTourStatus';
  completed: Scalars['Boolean']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AdminOverview: ResolverTypeWrapper<AdminOverview>;
  AssessmentAttempt: ResolverTypeWrapper<AssessmentAttempt>;
  AssessmentAttemptPage: ResolverTypeWrapper<AssessmentAttemptPage>;
  AssessmentAttemptStatus: AssessmentAttemptStatus;
  AssessmentCapabilities: ResolverTypeWrapper<AssessmentCapabilities>;
  AssessmentNotification: ResolverTypeWrapper<AssessmentNotification>;
  AssessmentNotificationPage: ResolverTypeWrapper<AssessmentNotificationPage>;
  AssessmentReview: ResolverTypeWrapper<AssessmentReview>;
  AssessmentSkill: AssessmentSkill;
  AssessmentSubmissionPage: ResolverTypeWrapper<AssessmentSubmissionPage>;
  AssessmentSubmissionSummary: ResolverTypeWrapper<AssessmentSubmissionSummary>;
  AssessmentSubmissionTask: ResolverTypeWrapper<AssessmentSubmissionTask>;
  AssessmentTask: ResolverTypeWrapper<AssessmentTask>;
  AssessmentTaskInput: AssessmentTaskInput;
  AssessmentTaskPage: ResolverTypeWrapper<AssessmentTaskPage>;
  AssessmentTaskStatus: AssessmentTaskStatus;
  AssessmentUpload: ResolverTypeWrapper<AssessmentUpload>;
  AssessmentWorkload: ResolverTypeWrapper<AssessmentWorkload>;
  AttemptOptionReview: ResolverTypeWrapper<AttemptOptionReview>;
  AttemptQuestionReview: ResolverTypeWrapper<AttemptQuestionReview>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CefrLevel: CefrLevel;
  CertificateType: CertificateType;
  CertificateVariant: CertificateVariant;
  ContentKind: ContentKind;
  ContentReview: ResolverTypeWrapper<ContentReview>;
  ContentReviewPage: ResolverTypeWrapper<ContentReviewPage>;
  ContentStatus: ContentStatus;
  DailyPath: ResolverTypeWrapper<DailyPath>;
  DailyQuest: ResolverTypeWrapper<DailyQuest>;
  DailyQuestKind: DailyQuestKind;
  DailyTask: ResolverTypeWrapper<DailyTask>;
  DailyTaskKind: DailyTaskKind;
  DailyTaskStatus: DailyTaskStatus;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DictationDailyAccuracy: ResolverTypeWrapper<DictationDailyAccuracy>;
  DictationDifficultSentence: ResolverTypeWrapper<DictationDifficultSentence>;
  DictationLesson: ResolverTypeWrapper<DictationLesson>;
  DictationLessonDetail: ResolverTypeWrapper<DictationLessonDetail>;
  DictationLessonPage: ResolverTypeWrapper<DictationLessonPage>;
  DictationMissedWord: ResolverTypeWrapper<DictationMissedWord>;
  DictationSentence: ResolverTypeWrapper<DictationSentence>;
  DictationSessionSummary: ResolverTypeWrapper<DictationSessionSummary>;
  DictationStats: ResolverTypeWrapper<DictationStats>;
  DictationSubmission: ResolverTypeWrapper<DictationSubmission>;
  Exam: ResolverTypeWrapper<Exam>;
  ExamAttempt: ResolverTypeWrapper<ExamAttempt>;
  ExamAttemptPage: ResolverTypeWrapper<ExamAttemptPage>;
  ExamAttemptStatus: ExamAttemptStatus;
  ExamDraft: ResolverTypeWrapper<ExamDraft>;
  ExamDraftAnswer: ResolverTypeWrapper<ExamDraftAnswer>;
  ExamListItem: ResolverTypeWrapper<ExamListItem>;
  ExamPage: ResolverTypeWrapper<ExamPage>;
  ExamPaper: ResolverTypeWrapper<ExamPaper>;
  ExamQuestion: ResolverTypeWrapper<ExamQuestion>;
  ExamQuestionSet: ResolverTypeWrapper<ExamQuestionSet>;
  ExamSectionDetail: ResolverTypeWrapper<ExamSectionDetail>;
  ExamSectionPart: ResolverTypeWrapper<ExamSectionPart>;
  ExamStatus: ExamStatus;
  ExamType: ExamType;
  Flashcard: ResolverTypeWrapper<Flashcard>;
  FlashcardDailyActivity: ResolverTypeWrapper<FlashcardDailyActivity>;
  FlashcardDifficultCard: ResolverTypeWrapper<FlashcardDifficultCard>;
  FlashcardReview: ResolverTypeWrapper<FlashcardReview>;
  FlashcardReviewStatus: FlashcardReviewStatus;
  FlashcardSessionSummary: ResolverTypeWrapper<FlashcardSessionSummary>;
  FlashcardSet: ResolverTypeWrapper<FlashcardSet>;
  FlashcardSetDetail: ResolverTypeWrapper<FlashcardSetDetail>;
  FlashcardSetPage: ResolverTypeWrapper<FlashcardSetPage>;
  FlashcardStats: ResolverTypeWrapper<FlashcardStats>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Gender: Gender;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LearnerAttemptStatus: LearnerAttemptStatus;
  LearnerExamItem: ResolverTypeWrapper<LearnerExamItem>;
  LearnerExamPage: ResolverTypeWrapper<LearnerExamPage>;
  LearningGoalInput: LearningGoalInput;
  LearningPurpose: ResolverTypeWrapper<LearningPurpose>;
  LearningSkill: LearningSkill;
  Me: ResolverTypeWrapper<Me>;
  MistakeSentence: ResolverTypeWrapper<MistakeSentence>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  OnboardingState: ResolverTypeWrapper<OnboardingState>;
  OnboardingStep: OnboardingStep;
  OverviewContentCounts: ResolverTypeWrapper<OverviewContentCounts>;
  OverviewContentKind: OverviewContentKind;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  QuestionOption: ResolverTypeWrapper<QuestionOption>;
  Quiz: ResolverTypeWrapper<Quiz>;
  QuizAnswerInput: QuizAnswerInput;
  QuizAttempt: ResolverTypeWrapper<QuizAttempt>;
  QuizAttemptStatus: QuizAttemptStatus;
  QuizOption: ResolverTypeWrapper<QuizOption>;
  QuizPage: ResolverTypeWrapper<QuizPage>;
  QuizPaper: ResolverTypeWrapper<QuizPaper>;
  QuizPaperQuestion: ResolverTypeWrapper<QuizPaperQuestion>;
  QuizQuestionReview: ResolverTypeWrapper<QuizQuestionReview>;
  QuizQuestionType: QuizQuestionType;
  ReviewRating: ReviewRating;
  Role: Role;
  SpeakingAttempt: ResolverTypeWrapper<SpeakingAttempt>;
  SpeakingAttemptStatus: SpeakingAttemptStatus;
  SpeakingPhonemeScore: ResolverTypeWrapper<SpeakingPhonemeScore>;
  SpeakingPrompt: ResolverTypeWrapper<SpeakingPrompt>;
  SpeakingPromptPage: ResolverTypeWrapper<SpeakingPromptPage>;
  SpeakingUploadTicket: ResolverTypeWrapper<SpeakingUploadTicket>;
  SpeakingWord: ResolverTypeWrapper<SpeakingWord>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SubmitAnswerInput: SubmitAnswerInput;
  TargetCertificate: TargetCertificate;
  TargetLevel: TargetLevel;
  TutorConversation: ResolverTypeWrapper<TutorConversation>;
  TutorConversationSummary: ResolverTypeWrapper<TutorConversationSummary>;
  TutorMessage: ResolverTypeWrapper<TutorMessage>;
  TutorMessageRole: TutorMessageRole;
  TutorMessageStatus: TutorMessageStatus;
  UpdateProfileInput: UpdateProfileInput;
  UserTourStatus: ResolverTypeWrapper<UserTourStatus>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AdminOverview: AdminOverview;
  AssessmentAttempt: AssessmentAttempt;
  AssessmentAttemptPage: AssessmentAttemptPage;
  AssessmentCapabilities: AssessmentCapabilities;
  AssessmentNotification: AssessmentNotification;
  AssessmentNotificationPage: AssessmentNotificationPage;
  AssessmentReview: AssessmentReview;
  AssessmentSubmissionPage: AssessmentSubmissionPage;
  AssessmentSubmissionSummary: AssessmentSubmissionSummary;
  AssessmentSubmissionTask: AssessmentSubmissionTask;
  AssessmentTask: AssessmentTask;
  AssessmentTaskInput: AssessmentTaskInput;
  AssessmentTaskPage: AssessmentTaskPage;
  AssessmentUpload: AssessmentUpload;
  AssessmentWorkload: AssessmentWorkload;
  AttemptOptionReview: AttemptOptionReview;
  AttemptQuestionReview: AttemptQuestionReview;
  Boolean: Scalars['Boolean']['output'];
  ContentReview: ContentReview;
  ContentReviewPage: ContentReviewPage;
  DailyPath: DailyPath;
  DailyQuest: DailyQuest;
  DailyTask: DailyTask;
  Date: Scalars['Date']['output'];
  DateTime: Scalars['DateTime']['output'];
  DictationDailyAccuracy: DictationDailyAccuracy;
  DictationDifficultSentence: DictationDifficultSentence;
  DictationLesson: DictationLesson;
  DictationLessonDetail: DictationLessonDetail;
  DictationLessonPage: DictationLessonPage;
  DictationMissedWord: DictationMissedWord;
  DictationSentence: DictationSentence;
  DictationSessionSummary: DictationSessionSummary;
  DictationStats: DictationStats;
  DictationSubmission: DictationSubmission;
  Exam: Exam;
  ExamAttempt: ExamAttempt;
  ExamAttemptPage: ExamAttemptPage;
  ExamDraft: ExamDraft;
  ExamDraftAnswer: ExamDraftAnswer;
  ExamListItem: ExamListItem;
  ExamPage: ExamPage;
  ExamPaper: ExamPaper;
  ExamQuestion: ExamQuestion;
  ExamQuestionSet: ExamQuestionSet;
  ExamSectionDetail: ExamSectionDetail;
  ExamSectionPart: ExamSectionPart;
  Flashcard: Flashcard;
  FlashcardDailyActivity: FlashcardDailyActivity;
  FlashcardDifficultCard: FlashcardDifficultCard;
  FlashcardReview: FlashcardReview;
  FlashcardSessionSummary: FlashcardSessionSummary;
  FlashcardSet: FlashcardSet;
  FlashcardSetDetail: FlashcardSetDetail;
  FlashcardSetPage: FlashcardSetPage;
  FlashcardStats: FlashcardStats;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  LearnerExamItem: LearnerExamItem;
  LearnerExamPage: LearnerExamPage;
  LearningGoalInput: LearningGoalInput;
  LearningPurpose: LearningPurpose;
  Me: Me;
  MistakeSentence: MistakeSentence;
  Mutation: Record<PropertyKey, never>;
  OnboardingState: OnboardingState;
  OverviewContentCounts: OverviewContentCounts;
  Query: Record<PropertyKey, never>;
  QuestionOption: QuestionOption;
  Quiz: Quiz;
  QuizAnswerInput: QuizAnswerInput;
  QuizAttempt: QuizAttempt;
  QuizOption: QuizOption;
  QuizPage: QuizPage;
  QuizPaper: QuizPaper;
  QuizPaperQuestion: QuizPaperQuestion;
  QuizQuestionReview: QuizQuestionReview;
  SpeakingAttempt: SpeakingAttempt;
  SpeakingPhonemeScore: SpeakingPhonemeScore;
  SpeakingPrompt: SpeakingPrompt;
  SpeakingPromptPage: SpeakingPromptPage;
  SpeakingUploadTicket: SpeakingUploadTicket;
  SpeakingWord: SpeakingWord;
  String: Scalars['String']['output'];
  SubmitAnswerInput: SubmitAnswerInput;
  TutorConversation: TutorConversation;
  TutorConversationSummary: TutorConversationSummary;
  TutorMessage: TutorMessage;
  UpdateProfileInput: UpdateProfileInput;
  UserTourStatus: UserTourStatus;
}>;

export type AdminOverviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminOverview'] = ResolversParentTypes['AdminOverview']> = ResolversObject<{
  activeLearners?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cardReviews?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  content?: Resolver<Array<ResolversTypes['OverviewContentCounts']>, ParentType, ContextType>;
  dictationSentences?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  examsSubmitted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  learners?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  newLearners?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingReviewTotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  periodDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  quizzesSubmitted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentAttemptResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentAttempt'] = ResolversParentTypes['AssessmentAttempt']> = ResolversObject<{
  answerText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assessedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  audioUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  errorCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  learnerId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  learnerName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recognizedText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  report?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  skill?: Resolver<ResolversTypes['AssessmentSkill'], ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AssessmentAttemptStatus'], ParentType, ContextType>;
  submittedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  task?: Resolver<ResolversTypes['AssessmentTask'], ParentType, ContextType>;
  taskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  wordCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentAttemptPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentAttemptPage'] = ResolversParentTypes['AssessmentAttemptPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['AssessmentAttempt']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentCapabilitiesResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentCapabilities'] = ResolversParentTypes['AssessmentCapabilities']> = ResolversObject<{
  automaticSpeaking?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  automaticWriting?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  humanReview?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type AssessmentNotificationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentNotification'] = ResolversParentTypes['AssessmentNotification']> = ResolversObject<{
  assessedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  attemptId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  skill?: Resolver<ResolversTypes['AssessmentSkill'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentNotificationPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentNotificationPage'] = ResolversParentTypes['AssessmentNotificationPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['AssessmentNotification']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentReviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentReview'] = ResolversParentTypes['AssessmentReview']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  note?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  previousReport?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  report?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reviewerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reviewerName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type AssessmentSubmissionPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentSubmissionPage'] = ResolversParentTypes['AssessmentSubmissionPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['AssessmentSubmissionSummary']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentSubmissionSummaryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentSubmissionSummary'] = ResolversParentTypes['AssessmentSubmissionSummary']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  learnerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  learnerName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  skill?: Resolver<ResolversTypes['AssessmentSkill'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AssessmentAttemptStatus'], ParentType, ContextType>;
  submittedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  task?: Resolver<ResolversTypes['AssessmentSubmissionTask'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentSubmissionTaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentSubmissionTask'] = ResolversParentTypes['AssessmentSubmissionTask']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type AssessmentTaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentTask'] = ResolversParentTypes['AssessmentTask']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  instructions?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  minimumWords?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reviewNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rubricNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sampleAnswer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  skill?: Resolver<ResolversTypes['AssessmentSkill'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AssessmentTaskStatus'], ParentType, ContextType>;
  taskType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timeLimitSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentTaskPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentTaskPage'] = ResolversParentTypes['AssessmentTaskPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['AssessmentTask']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AssessmentUploadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentUpload'] = ResolversParentTypes['AssessmentUpload']> = ResolversObject<{
  attempt?: Resolver<ResolversTypes['AssessmentAttempt'], ParentType, ContextType>;
  uploadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type AssessmentWorkloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssessmentWorkload'] = ResolversParentTypes['AssessmentWorkload']> = ResolversObject<{
  completed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  drafts?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  failed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  needsReview?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingReview?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  published?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rejected?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AttemptOptionReviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AttemptOptionReview'] = ResolversParentTypes['AttemptOptionReview']> = ResolversObject<{
  correct?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  explanation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  optionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type AttemptQuestionReviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AttemptQuestionReview'] = ResolversParentTypes['AttemptQuestionReview']> = ResolversObject<{
  awardedRawScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  correct?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  correctOptionIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  explanation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  options?: Resolver<Array<ResolversTypes['AttemptOptionReview']>, ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  selectedOptionIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
}>;

export type ContentReviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ContentReview'] = ResolversParentTypes['ContentReview']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  itemCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  reviewNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviewedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  reviewedByUserId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ContentStatus'], ParentType, ContextType>;
  submittedForReviewAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type ContentReviewPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ContentReviewPage'] = ResolversParentTypes['ContentReviewPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['ContentReview']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DailyPathResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DailyPath'] = ResolversParentTypes['DailyPath']> = ResolversObject<{
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  levelCostXp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  quests?: Resolver<Array<ResolversTypes['DailyQuest']>, ParentType, ContextType>;
  streakDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['DailyTask']>, ParentType, ContextType>;
  totalXp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  xpIntoLevel?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DailyQuestResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DailyQuest'] = ResolversParentTypes['DailyQuest']> = ResolversObject<{
  completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  kind?: Resolver<ResolversTypes['DailyQuestKind'], ParentType, ContextType>;
  progress?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DailyTaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DailyTask'] = ResolversParentTypes['DailyTask']> = ResolversObject<{
  completionPercent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  kind?: Resolver<ResolversTypes['DailyTaskKind'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['DailyTaskStatus'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unitsDoneToday?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unitsRemaining?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  xpReward?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DictationDailyAccuracyResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationDailyAccuracy'] = ResolversParentTypes['DictationDailyAccuracy']> = ResolversObject<{
  accuracyPercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  attemptCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  day?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
}>;

export type DictationDifficultSentenceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationDifficultSentence'] = ResolversParentTypes['DictationDifficultSentence']> = ResolversObject<{
  accuracyPercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  attemptCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sentenceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  topic?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DictationLessonResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationLesson'] = ResolversParentTypes['DictationLesson']> = ResolversObject<{
  completedSentenceCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastPractisedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sentenceCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  topic?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalDurationSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DictationLessonDetailResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationLessonDetail'] = ResolversParentTypes['DictationLessonDetail']> = ResolversObject<{
  lesson?: Resolver<ResolversTypes['DictationLesson'], ParentType, ContextType>;
  sentences?: Resolver<Array<ResolversTypes['DictationSentence']>, ParentType, ContextType>;
}>;

export type DictationLessonPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationLessonPage'] = ResolversParentTypes['DictationLessonPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['DictationLesson']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DictationMissedWordResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationMissedWord'] = ResolversParentTypes['DictationMissedWord']> = ResolversObject<{
  accuracyPercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  correctCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  missedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  word?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DictationSentenceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationSentence'] = ResolversParentTypes['DictationSentence']> = ResolversObject<{
  audioDurationSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  audioEndMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  audioStartMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  audioUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bestAccuracyPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  hintFirstLetters?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hintPartialTranscript?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hintRevealWord?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hintWordCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DictationSessionSummaryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationSessionSummary'] = ResolversParentTypes['DictationSessionSummary']> = ResolversObject<{
  accuracyPercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  day?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  lessonId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lessonTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  listeningSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sentenceCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DictationStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationStats'] = ResolversParentTypes['DictationStats']> = ResolversObject<{
  activity?: Resolver<Array<ResolversTypes['DictationDailyAccuracy']>, ParentType, ContextType>;
  averageAccuracyPercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  difficultSentences?: Resolver<Array<ResolversTypes['DictationDifficultSentence']>, ParentType, ContextType>;
  history?: Resolver<Array<ResolversTypes['DictationSessionSummary']>, ParentType, ContextType>;
  lessonsCompleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  listeningSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  missedWords?: Resolver<Array<ResolversTypes['DictationMissedWord']>, ParentType, ContextType>;
  periodDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sentencesPractised?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  streakDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DictationSubmissionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DictationSubmission'] = ResolversParentTypes['DictationSubmission']> = ResolversObject<{
  accuracyPercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  cleared?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  correctText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  correctWordCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  response?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sentenceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  totalWordCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  translationVi?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ExamResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Exam'] = ResolversParentTypes['Exam']> = ResolversObject<{
  certificateType?: Resolver<Maybe<ResolversTypes['CertificateType']>, ParentType, ContextType>;
  certificateVariant?: Resolver<Maybe<ResolversTypes['CertificateVariant']>, ParentType, ContextType>;
  createdByUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  durationSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  examType?: Resolver<ResolversTypes['ExamType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxRawScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  passScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  reviewNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviewedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  reviewedByUserId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ExamStatus'], ParentType, ContextType>;
  submittedForReviewAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  targetLevel?: Resolver<Maybe<ResolversTypes['TargetLevel']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  versionNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type ExamAttemptResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamAttempt'] = ResolversParentTypes['ExamAttempt']> = ResolversObject<{
  correctAnswerCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  examId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  examTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxRawScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  questionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questions?: Resolver<Array<ResolversTypes['AttemptQuestionReview']>, ParentType, ContextType>;
  rawScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  resumed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scorePercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  scoredAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ExamAttemptStatus'], ParentType, ContextType>;
  submittedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
}>;

export type ExamAttemptPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamAttemptPage'] = ResolversParentTypes['ExamAttemptPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['ExamAttempt']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type ExamDraftResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamDraft'] = ResolversParentTypes['ExamDraft']> = ResolversObject<{
  answers?: Resolver<Array<ResolversTypes['ExamDraftAnswer']>, ParentType, ContextType>;
  savedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type ExamDraftAnswerResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamDraftAnswer'] = ResolversParentTypes['ExamDraftAnswer']> = ResolversObject<{
  questionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  selectedOptionIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
}>;

export type ExamListItemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamListItem'] = ResolversParentTypes['ExamListItem']> = ResolversObject<{
  certificateType?: Resolver<Maybe<ResolversTypes['CertificateType']>, ParentType, ContextType>;
  certificateVariant?: Resolver<Maybe<ResolversTypes['CertificateVariant']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdByUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  examType?: Resolver<ResolversTypes['ExamType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  reviewNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ExamStatus'], ParentType, ContextType>;
  submittedForReviewAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  targetLevel?: Resolver<Maybe<ResolversTypes['TargetLevel']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  versionNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type ExamPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamPage'] = ResolversParentTypes['ExamPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['ExamListItem']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type ExamPaperResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamPaper'] = ResolversParentTypes['ExamPaper']> = ResolversObject<{
  certificateType?: Resolver<Maybe<ResolversTypes['CertificateType']>, ParentType, ContextType>;
  certificateVariant?: Resolver<Maybe<ResolversTypes['CertificateVariant']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  durationSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  examType?: Resolver<ResolversTypes['ExamType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxRawScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  passScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sections?: Resolver<Array<ResolversTypes['ExamSectionDetail']>, ParentType, ContextType>;
  targetLevel?: Resolver<Maybe<ResolversTypes['TargetLevel']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  versionNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type ExamQuestionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamQuestion'] = ResolversParentTypes['ExamQuestion']> = ResolversObject<{
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  difficultyLevel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxRawScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  options?: Resolver<Array<ResolversTypes['QuestionOption']>, ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questionCategory?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questionType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  skillType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type ExamQuestionSetResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamQuestionSet'] = ResolversParentTypes['ExamQuestionSet']> = ResolversObject<{
  audioUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instruction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questions?: Resolver<Array<ResolversTypes['ExamQuestion']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ExamSectionDetailResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamSectionDetail'] = ResolversParentTypes['ExamSectionDetail']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxRawScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  parts?: Resolver<Array<ResolversTypes['ExamSectionPart']>, ParentType, ContextType>;
  scoredByCriteria?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  sectionType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timeLimitSeconds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type ExamSectionPartResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExamSectionPart'] = ResolversParentTypes['ExamSectionPart']> = ResolversObject<{
  audioUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instruction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questionSets?: Resolver<Array<ResolversTypes['ExamQuestionSet']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type FlashcardResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Flashcard'] = ResolversParentTypes['Flashcard']> = ResolversObject<{
  audioUkUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  audioUsUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cefrLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  definitionEn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  definitionVi?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dueAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  exampleSentence?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  exampleTranslationVi?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ipaUk?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ipaUs?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lapseCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lemma?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mnemonicTipVi?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  partOfSpeech?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  senseLabel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['FlashcardReviewStatus'], ParentType, ContextType>;
}>;

export type FlashcardDailyActivityResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FlashcardDailyActivity'] = ResolversParentTypes['FlashcardDailyActivity']> = ResolversObject<{
  cardCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  day?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
}>;

export type FlashcardDifficultCardResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FlashcardDifficultCard'] = ResolversParentTypes['FlashcardDifficultCard']> = ResolversObject<{
  flashcardId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lapseCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastReviewed?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lemma?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  setName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type FlashcardReviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FlashcardReview'] = ResolversParentTypes['FlashcardReview']> = ResolversObject<{
  dueAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  flashcardId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  intervalDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lapseCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  repetitions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['FlashcardReviewStatus'], ParentType, ContextType>;
}>;

export type FlashcardSessionSummaryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FlashcardSessionSummary'] = ResolversParentTypes['FlashcardSessionSummary']> = ResolversObject<{
  cardCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  day?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  recallPercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  setId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  setName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  studySeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type FlashcardSetResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FlashcardSet'] = ResolversParentTypes['FlashcardSet']> = ResolversObject<{
  cardCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dueCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastStudiedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  masteredCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topic?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type FlashcardSetDetailResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FlashcardSetDetail'] = ResolversParentTypes['FlashcardSetDetail']> = ResolversObject<{
  cards?: Resolver<Array<ResolversTypes['Flashcard']>, ParentType, ContextType>;
  set?: Resolver<ResolversTypes['FlashcardSet'], ParentType, ContextType>;
}>;

export type FlashcardSetPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FlashcardSetPage'] = ResolversParentTypes['FlashcardSetPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['FlashcardSet']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type FlashcardStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FlashcardStats'] = ResolversParentTypes['FlashcardStats']> = ResolversObject<{
  activity?: Resolver<Array<ResolversTypes['FlashcardDailyActivity']>, ParentType, ContextType>;
  cardsStudied?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  difficultCards?: Resolver<Array<ResolversTypes['FlashcardDifficultCard']>, ParentType, ContextType>;
  history?: Resolver<Array<ResolversTypes['FlashcardSessionSummary']>, ParentType, ContextType>;
  periodDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  retentionPercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  streakDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  studySeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type LearnerExamItemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LearnerExamItem'] = ResolversParentTypes['LearnerExamItem']> = ResolversObject<{
  attemptStatus?: Resolver<ResolversTypes['LearnerAttemptStatus'], ParentType, ContextType>;
  bestScorePercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  certificateType?: Resolver<Maybe<ResolversTypes['CertificateType']>, ParentType, ContextType>;
  certificateVariant?: Resolver<Maybe<ResolversTypes['CertificateVariant']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  durationSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  examType?: Resolver<ResolversTypes['ExamType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxRawScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  passScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  questionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ExamStatus'], ParentType, ContextType>;
  targetLevel?: Resolver<Maybe<ResolversTypes['TargetLevel']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type LearnerExamPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LearnerExamPage'] = ResolversParentTypes['LearnerExamPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['LearnerExamItem']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type LearningPurposeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LearningPurpose'] = ResolversParentTypes['LearningPurpose']> = ResolversObject<{
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  purposeCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Me'] = ResolversParentTypes['Me']> = ResolversObject<{
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bannerUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  birthDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fullName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['Gender']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  onboardingState?: Resolver<Maybe<ResolversTypes['OnboardingState']>, ParentType, ContextType>;
  onboardingStep?: Resolver<ResolversTypes['OnboardingStep'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
}>;

export type MistakeSentenceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MistakeSentence'] = ResolversParentTypes['MistakeSentence']> = ResolversObject<{
  attemptCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  audioDurationSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  audioEndMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  audioStartMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  audioUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bestAccuracyPercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastResponse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lessonId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lessonTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sentenceId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  approveContent?: Resolver<ResolversTypes['ContentReview'], ParentType, ContextType, RequireFields<MutationApproveContentArgs, 'id' | 'kind'>>;
  approveExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationApproveExamArgs, 'id'>>;
  archiveContent?: Resolver<ResolversTypes['ContentReview'], ParentType, ContextType, RequireFields<MutationArchiveContentArgs, 'id' | 'kind'>>;
  archiveExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationArchiveExamArgs, 'id'>>;
  archiveTutorConversation?: Resolver<ResolversTypes['TutorConversationSummary'], ParentType, ContextType, RequireFields<MutationArchiveTutorConversationArgs, 'id'>>;
  completeMyTour?: Resolver<ResolversTypes['UserTourStatus'], ParentType, ContextType>;
  completeOnboarding?: Resolver<ResolversTypes['OnboardingState'], ParentType, ContextType>;
  createAssessmentTask?: Resolver<ResolversTypes['AssessmentTask'], ParentType, ContextType, RequireFields<MutationCreateAssessmentTaskArgs, 'input'>>;
  editAssessmentTask?: Resolver<ResolversTypes['AssessmentTask'], ParentType, ContextType, RequireFields<MutationEditAssessmentTaskArgs, 'id' | 'input' | 'version'>>;
  gradeAssessment?: Resolver<ResolversTypes['AssessmentAttempt'], ParentType, ContextType, RequireFields<MutationGradeAssessmentArgs, 'id' | 'note' | 'report' | 'version'>>;
  publishContent?: Resolver<ResolversTypes['ContentReview'], ParentType, ContextType, RequireFields<MutationPublishContentArgs, 'id' | 'kind'>>;
  publishExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationPublishExamArgs, 'id'>>;
  rateFlashcard?: Resolver<ResolversTypes['FlashcardReview'], ParentType, ContextType, RequireFields<MutationRateFlashcardArgs, 'flashcardId' | 'rating' | 'timeSpentSeconds'>>;
  readAssessmentResult?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationReadAssessmentResultArgs, 'id' | 'version'>>;
  rejectContent?: Resolver<ResolversTypes['ContentReview'], ParentType, ContextType, RequireFields<MutationRejectContentArgs, 'id' | 'kind' | 'note'>>;
  rejectExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationRejectExamArgs, 'id' | 'note'>>;
  reportTutorMessage?: Resolver<ResolversTypes['TutorMessage'], ParentType, ContextType, RequireFields<MutationReportTutorMessageArgs, 'conversationId' | 'messageId'>>;
  requestAssessmentReview?: Resolver<ResolversTypes['AssessmentAttempt'], ParentType, ContextType, RequireFields<MutationRequestAssessmentReviewArgs, 'id'>>;
  restoreContent?: Resolver<ResolversTypes['ContentReview'], ParentType, ContextType, RequireFields<MutationRestoreContentArgs, 'id' | 'kind'>>;
  restoreExam?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationRestoreExamArgs, 'id'>>;
  retryAssessment?: Resolver<ResolversTypes['AssessmentAttempt'], ParentType, ContextType, RequireFields<MutationRetryAssessmentArgs, 'id'>>;
  saveAssessmentDraft?: Resolver<ResolversTypes['AssessmentAttempt'], ParentType, ContextType, RequireFields<MutationSaveAssessmentDraftArgs, 'answerText' | 'id' | 'version'>>;
  saveExamDraft?: Resolver<ResolversTypes['ExamDraft'], ParentType, ContextType, RequireFields<MutationSaveExamDraftArgs, 'answers' | 'attemptId' | 'version'>>;
  selectLearningPurposes?: Resolver<ResolversTypes['OnboardingState'], ParentType, ContextType, RequireFields<MutationSelectLearningPurposesArgs, 'purposeIds'>>;
  selectTargetSkills?: Resolver<ResolversTypes['OnboardingState'], ParentType, ContextType, RequireFields<MutationSelectTargetSkillsArgs, 'skills'>>;
  sendTutorMessage?: Resolver<ResolversTypes['TutorConversation'], ParentType, ContextType, RequireFields<MutationSendTutorMessageArgs, 'message'>>;
  setCertificateTarget?: Resolver<ResolversTypes['OnboardingState'], ParentType, ContextType, RequireFields<MutationSetCertificateTargetArgs, 'certificateType'>>;
  setCurrentLevel?: Resolver<ResolversTypes['OnboardingState'], ParentType, ContextType, RequireFields<MutationSetCurrentLevelArgs, 'level'>>;
  setLearningGoal?: Resolver<ResolversTypes['OnboardingState'], ParentType, ContextType, RequireFields<MutationSetLearningGoalArgs, 'input'>>;
  startAssessment?: Resolver<ResolversTypes['AssessmentUpload'], ParentType, ContextType, RequireFields<MutationStartAssessmentArgs, 'clientKey' | 'taskId'>>;
  startExamAttempt?: Resolver<ResolversTypes['ExamAttempt'], ParentType, ContextType, RequireFields<MutationStartExamAttemptArgs, 'examId'>>;
  startQuizAttempt?: Resolver<ResolversTypes['QuizAttempt'], ParentType, ContextType, RequireFields<MutationStartQuizAttemptArgs, 'quizId'>>;
  startSpeakingAttempt?: Resolver<ResolversTypes['SpeakingUploadTicket'], ParentType, ContextType, RequireFields<MutationStartSpeakingAttemptArgs, 'contentLength' | 'contentType' | 'promptId'>>;
  submitAssessment?: Resolver<ResolversTypes['AssessmentAttempt'], ParentType, ContextType, RequireFields<MutationSubmitAssessmentArgs, 'id'>>;
  submitContentForReview?: Resolver<ResolversTypes['ContentReview'], ParentType, ContextType, RequireFields<MutationSubmitContentForReviewArgs, 'id' | 'kind'>>;
  submitDictation?: Resolver<ResolversTypes['DictationSubmission'], ParentType, ContextType, RequireFields<MutationSubmitDictationArgs, 'response' | 'sentenceId'>>;
  submitExamAttempt?: Resolver<ResolversTypes['ExamAttempt'], ParentType, ContextType, RequireFields<MutationSubmitExamAttemptArgs, 'answers' | 'attemptId'>>;
  submitExamForReview?: Resolver<ResolversTypes['Exam'], ParentType, ContextType, RequireFields<MutationSubmitExamForReviewArgs, 'id'>>;
  submitQuizAttempt?: Resolver<ResolversTypes['QuizAttempt'], ParentType, ContextType, RequireFields<MutationSubmitQuizAttemptArgs, 'answers' | 'attemptId'>>;
  submitSpeakingAttempt?: Resolver<ResolversTypes['SpeakingAttempt'], ParentType, ContextType, RequireFields<MutationSubmitSpeakingAttemptArgs, 'attemptId'>>;
  transitionAssessmentTask?: Resolver<ResolversTypes['AssessmentTask'], ParentType, ContextType, RequireFields<MutationTransitionAssessmentTaskArgs, 'action' | 'id'>>;
  updateProfile?: Resolver<ResolversTypes['Me'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
}>;

export type OnboardingStateResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OnboardingState'] = ResolversParentTypes['OnboardingState']> = ResolversObject<{
  certificateLearner?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  currentLevel?: Resolver<Maybe<ResolversTypes['CefrLevel']>, ParentType, ContextType>;
  learningPurposeIds?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  step?: Resolver<ResolversTypes['OnboardingStep'], ParentType, ContextType>;
  targetCertificateType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  targetDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  targetScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  targetSkills?: Resolver<Array<ResolversTypes['LearningSkill']>, ParentType, ContextType>;
}>;

export type OverviewContentCountsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OverviewContentCounts'] = ResolversParentTypes['OverviewContentCounts']> = ResolversObject<{
  drafts?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  kind?: Resolver<ResolversTypes['OverviewContentKind'], ParentType, ContextType>;
  pendingReview?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  published?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  adminContent?: Resolver<ResolversTypes['ContentReviewPage'], ParentType, ContextType, RequireFields<QueryAdminContentArgs, 'kind' | 'page' | 'size'>>;
  adminExams?: Resolver<ResolversTypes['ExamPage'], ParentType, ContextType, RequireFields<QueryAdminExamsArgs, 'page' | 'size'>>;
  adminOverview?: Resolver<ResolversTypes['AdminOverview'], ParentType, ContextType>;
  assessmentAttempt?: Resolver<ResolversTypes['AssessmentAttempt'], ParentType, ContextType, RequireFields<QueryAssessmentAttemptArgs, 'id'>>;
  assessmentCapabilities?: Resolver<ResolversTypes['AssessmentCapabilities'], ParentType, ContextType>;
  assessmentHistory?: Resolver<ResolversTypes['AssessmentAttemptPage'], ParentType, ContextType, Partial<QueryAssessmentHistoryArgs>>;
  assessmentNotifications?: Resolver<ResolversTypes['AssessmentNotificationPage'], ParentType, ContextType, Partial<QueryAssessmentNotificationsArgs>>;
  assessmentReviews?: Resolver<Array<ResolversTypes['AssessmentReview']>, ParentType, ContextType, RequireFields<QueryAssessmentReviewsArgs, 'id'>>;
  assessmentSubmission?: Resolver<ResolversTypes['AssessmentAttempt'], ParentType, ContextType, RequireFields<QueryAssessmentSubmissionArgs, 'id'>>;
  assessmentSubmissions?: Resolver<ResolversTypes['AssessmentSubmissionPage'], ParentType, ContextType, Partial<QueryAssessmentSubmissionsArgs>>;
  assessmentTask?: Resolver<ResolversTypes['AssessmentTask'], ParentType, ContextType, RequireFields<QueryAssessmentTaskArgs, 'id'>>;
  assessmentTasks?: Resolver<ResolversTypes['AssessmentTaskPage'], ParentType, ContextType, Partial<QueryAssessmentTasksArgs>>;
  assessmentWorkload?: Resolver<ResolversTypes['AssessmentWorkload'], ParentType, ContextType>;
  attemptPaper?: Resolver<ResolversTypes['ExamPaper'], ParentType, ContextType, RequireFields<QueryAttemptPaperArgs, 'attemptId'>>;
  authoringAssessmentTask?: Resolver<ResolversTypes['AssessmentTask'], ParentType, ContextType, RequireFields<QueryAuthoringAssessmentTaskArgs, 'id'>>;
  authoringAssessmentTasks?: Resolver<ResolversTypes['AssessmentTaskPage'], ParentType, ContextType, Partial<QueryAuthoringAssessmentTasksArgs>>;
  dailyPath?: Resolver<ResolversTypes['DailyPath'], ParentType, ContextType>;
  dictationLesson?: Resolver<ResolversTypes['DictationLessonDetail'], ParentType, ContextType, RequireFields<QueryDictationLessonArgs, 'id'>>;
  dictationLessons?: Resolver<ResolversTypes['DictationLessonPage'], ParentType, ContextType, RequireFields<QueryDictationLessonsArgs, 'page' | 'size'>>;
  dictationMistakes?: Resolver<Array<ResolversTypes['MistakeSentence']>, ParentType, ContextType>;
  dictationStats?: Resolver<ResolversTypes['DictationStats'], ParentType, ContextType, RequireFields<QueryDictationStatsArgs, 'periodDays'>>;
  exam?: Resolver<Maybe<ResolversTypes['LearnerExamItem']>, ParentType, ContextType, RequireFields<QueryExamArgs, 'id'>>;
  examAttempt?: Resolver<ResolversTypes['ExamAttempt'], ParentType, ContextType, RequireFields<QueryExamAttemptArgs, 'id'>>;
  examAttempts?: Resolver<ResolversTypes['ExamAttemptPage'], ParentType, ContextType, RequireFields<QueryExamAttemptsArgs, 'page' | 'size'>>;
  examDraft?: Resolver<ResolversTypes['ExamDraft'], ParentType, ContextType, RequireFields<QueryExamDraftArgs, 'attemptId'>>;
  exams?: Resolver<ResolversTypes['LearnerExamPage'], ParentType, ContextType, RequireFields<QueryExamsArgs, 'page' | 'size'>>;
  flashcardSet?: Resolver<ResolversTypes['FlashcardSetDetail'], ParentType, ContextType, RequireFields<QueryFlashcardSetArgs, 'id'>>;
  flashcardSets?: Resolver<ResolversTypes['FlashcardSetPage'], ParentType, ContextType, RequireFields<QueryFlashcardSetsArgs, 'page' | 'size'>>;
  flashcardStats?: Resolver<ResolversTypes['FlashcardStats'], ParentType, ContextType, RequireFields<QueryFlashcardStatsArgs, 'periodDays'>>;
  flashcardStudyQueue?: Resolver<Array<ResolversTypes['Flashcard']>, ParentType, ContextType, RequireFields<QueryFlashcardStudyQueueArgs, 'limit' | 'setId'>>;
  health?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  learningPurposes?: Resolver<Array<ResolversTypes['LearningPurpose']>, ParentType, ContextType>;
  me?: Resolver<ResolversTypes['Me'], ParentType, ContextType>;
  myTourStatus?: Resolver<ResolversTypes['UserTourStatus'], ParentType, ContextType>;
  placementExam?: Resolver<ResolversTypes['LearnerExamItem'], ParentType, ContextType>;
  quizAttempt?: Resolver<ResolversTypes['QuizAttempt'], ParentType, ContextType, RequireFields<QueryQuizAttemptArgs, 'id'>>;
  quizPaper?: Resolver<ResolversTypes['QuizPaper'], ParentType, ContextType, RequireFields<QueryQuizPaperArgs, 'attemptId'>>;
  quizzes?: Resolver<ResolversTypes['QuizPage'], ParentType, ContextType, RequireFields<QueryQuizzesArgs, 'page' | 'size'>>;
  speakingAttempt?: Resolver<ResolversTypes['SpeakingAttempt'], ParentType, ContextType, RequireFields<QuerySpeakingAttemptArgs, 'id'>>;
  speakingAttempts?: Resolver<Array<ResolversTypes['SpeakingAttempt']>, ParentType, ContextType, RequireFields<QuerySpeakingAttemptsArgs, 'promptId'>>;
  speakingPrompt?: Resolver<ResolversTypes['SpeakingPrompt'], ParentType, ContextType, RequireFields<QuerySpeakingPromptArgs, 'id'>>;
  speakingPrompts?: Resolver<ResolversTypes['SpeakingPromptPage'], ParentType, ContextType, RequireFields<QuerySpeakingPromptsArgs, 'page' | 'size'>>;
  tutorConversation?: Resolver<ResolversTypes['TutorConversation'], ParentType, ContextType, RequireFields<QueryTutorConversationArgs, 'id'>>;
  tutorConversations?: Resolver<Array<ResolversTypes['TutorConversationSummary']>, ParentType, ContextType>;
}>;

export type QuestionOptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['QuestionOption'] = ResolversParentTypes['QuestionOption']> = ResolversObject<{
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type QuizResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Quiz'] = ResolversParentTypes['Quiz']> = ResolversObject<{
  attemptCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bestScorePercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  passingScorePercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  questionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeLimitSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type QuizAttemptResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['QuizAttempt'] = ResolversParentTypes['QuizAttempt']> = ResolversObject<{
  correctAnswerCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  passed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  questionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  quizId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  quizTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resumed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  reviews?: Resolver<Array<ResolversTypes['QuizQuestionReview']>, ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  scorePercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  startedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['QuizAttemptStatus'], ParentType, ContextType>;
  submittedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
}>;

export type QuizOptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['QuizOption'] = ResolversParentTypes['QuizOption']> = ResolversObject<{
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type QuizPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['QuizPage'] = ResolversParentTypes['QuizPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['Quiz']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type QuizPaperResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['QuizPaper'] = ResolversParentTypes['QuizPaper']> = ResolversObject<{
  attemptId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  questions?: Resolver<Array<ResolversTypes['QuizPaperQuestion']>, ParentType, ContextType>;
  quizId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeLimitSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type QuizPaperQuestionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['QuizPaperQuestion'] = ResolversParentTypes['QuizPaperQuestion']> = ResolversObject<{
  afterText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  beforeText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  leftTexts?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  options?: Resolver<Array<ResolversTypes['QuizOption']>, ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  originalSentence?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  prompt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  questionType?: Resolver<ResolversTypes['QuizQuestionType'], ParentType, ContextType>;
  rewriteKeyword?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rightTexts?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  scrambledWords?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  wordBank?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type QuizQuestionReviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['QuizQuestionReview'] = ResolversParentTypes['QuizQuestionReview']> = ResolversObject<{
  correct?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  correctAnswerText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  explanation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pointsEarned?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  pointsPossible?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  prompt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  questionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  questionType?: Resolver<ResolversTypes['QuizQuestionType'], ParentType, ContextType>;
  userAnswerText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SpeakingAttemptResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SpeakingAttempt'] = ResolversParentTypes['SpeakingAttempt']> = ResolversObject<{
  accuracyPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  assessedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  audioUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  completenessPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  errorCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fluencyPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  promptTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pronunciationPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  prosodyPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  recognizedText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  speakingPromptId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SpeakingAttemptStatus'], ParentType, ContextType>;
  words?: Resolver<Array<ResolversTypes['SpeakingWord']>, ParentType, ContextType>;
}>;

export type SpeakingPhonemeScoreResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SpeakingPhonemeScore'] = ResolversParentTypes['SpeakingPhonemeScore']> = ResolversObject<{
  accuracy?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  phoneme?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SpeakingPromptResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SpeakingPrompt'] = ResolversParentTypes['SpeakingPrompt']> = ResolversObject<{
  bestScorePercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ipaTranscript?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phonemeTarget?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tips?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  translationVi?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SpeakingPromptPageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SpeakingPromptPage'] = ResolversParentTypes['SpeakingPromptPage']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['SpeakingPrompt']>, ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type SpeakingUploadTicketResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SpeakingUploadTicket'] = ResolversParentTypes['SpeakingUploadTicket']> = ResolversObject<{
  attemptId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  contentType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresInSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  uploadUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SpeakingWordResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SpeakingWord'] = ResolversParentTypes['SpeakingWord']> = ResolversObject<{
  accuracyPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  durationMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  errorType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  offsetMs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  phonemes?: Resolver<Array<ResolversTypes['SpeakingPhonemeScore']>, ParentType, ContextType>;
  word?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type TutorConversationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TutorConversation'] = ResolversParentTypes['TutorConversation']> = ResolversObject<{
  conversation?: Resolver<ResolversTypes['TutorConversationSummary'], ParentType, ContextType>;
  messages?: Resolver<Array<ResolversTypes['TutorMessage']>, ParentType, ContextType>;
}>;

export type TutorConversationSummaryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TutorConversationSummary'] = ResolversParentTypes['TutorConversationSummary']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastMessageAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  messageCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  topic?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type TutorMessageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TutorMessage'] = ResolversParentTypes['TutorMessage']> = ResolversObject<{
  answeredAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  errorCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  model?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderNo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reported?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['TutorMessageRole'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TutorMessageStatus'], ParentType, ContextType>;
}>;

export type UserTourStatusResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserTourStatus'] = ResolversParentTypes['UserTourStatus']> = ResolversObject<{
  completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  AdminOverview?: AdminOverviewResolvers<ContextType>;
  AssessmentAttempt?: AssessmentAttemptResolvers<ContextType>;
  AssessmentAttemptPage?: AssessmentAttemptPageResolvers<ContextType>;
  AssessmentCapabilities?: AssessmentCapabilitiesResolvers<ContextType>;
  AssessmentNotification?: AssessmentNotificationResolvers<ContextType>;
  AssessmentNotificationPage?: AssessmentNotificationPageResolvers<ContextType>;
  AssessmentReview?: AssessmentReviewResolvers<ContextType>;
  AssessmentSubmissionPage?: AssessmentSubmissionPageResolvers<ContextType>;
  AssessmentSubmissionSummary?: AssessmentSubmissionSummaryResolvers<ContextType>;
  AssessmentSubmissionTask?: AssessmentSubmissionTaskResolvers<ContextType>;
  AssessmentTask?: AssessmentTaskResolvers<ContextType>;
  AssessmentTaskPage?: AssessmentTaskPageResolvers<ContextType>;
  AssessmentUpload?: AssessmentUploadResolvers<ContextType>;
  AssessmentWorkload?: AssessmentWorkloadResolvers<ContextType>;
  AttemptOptionReview?: AttemptOptionReviewResolvers<ContextType>;
  AttemptQuestionReview?: AttemptQuestionReviewResolvers<ContextType>;
  ContentReview?: ContentReviewResolvers<ContextType>;
  ContentReviewPage?: ContentReviewPageResolvers<ContextType>;
  DailyPath?: DailyPathResolvers<ContextType>;
  DailyQuest?: DailyQuestResolvers<ContextType>;
  DailyTask?: DailyTaskResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  DictationDailyAccuracy?: DictationDailyAccuracyResolvers<ContextType>;
  DictationDifficultSentence?: DictationDifficultSentenceResolvers<ContextType>;
  DictationLesson?: DictationLessonResolvers<ContextType>;
  DictationLessonDetail?: DictationLessonDetailResolvers<ContextType>;
  DictationLessonPage?: DictationLessonPageResolvers<ContextType>;
  DictationMissedWord?: DictationMissedWordResolvers<ContextType>;
  DictationSentence?: DictationSentenceResolvers<ContextType>;
  DictationSessionSummary?: DictationSessionSummaryResolvers<ContextType>;
  DictationStats?: DictationStatsResolvers<ContextType>;
  DictationSubmission?: DictationSubmissionResolvers<ContextType>;
  Exam?: ExamResolvers<ContextType>;
  ExamAttempt?: ExamAttemptResolvers<ContextType>;
  ExamAttemptPage?: ExamAttemptPageResolvers<ContextType>;
  ExamDraft?: ExamDraftResolvers<ContextType>;
  ExamDraftAnswer?: ExamDraftAnswerResolvers<ContextType>;
  ExamListItem?: ExamListItemResolvers<ContextType>;
  ExamPage?: ExamPageResolvers<ContextType>;
  ExamPaper?: ExamPaperResolvers<ContextType>;
  ExamQuestion?: ExamQuestionResolvers<ContextType>;
  ExamQuestionSet?: ExamQuestionSetResolvers<ContextType>;
  ExamSectionDetail?: ExamSectionDetailResolvers<ContextType>;
  ExamSectionPart?: ExamSectionPartResolvers<ContextType>;
  Flashcard?: FlashcardResolvers<ContextType>;
  FlashcardDailyActivity?: FlashcardDailyActivityResolvers<ContextType>;
  FlashcardDifficultCard?: FlashcardDifficultCardResolvers<ContextType>;
  FlashcardReview?: FlashcardReviewResolvers<ContextType>;
  FlashcardSessionSummary?: FlashcardSessionSummaryResolvers<ContextType>;
  FlashcardSet?: FlashcardSetResolvers<ContextType>;
  FlashcardSetDetail?: FlashcardSetDetailResolvers<ContextType>;
  FlashcardSetPage?: FlashcardSetPageResolvers<ContextType>;
  FlashcardStats?: FlashcardStatsResolvers<ContextType>;
  LearnerExamItem?: LearnerExamItemResolvers<ContextType>;
  LearnerExamPage?: LearnerExamPageResolvers<ContextType>;
  LearningPurpose?: LearningPurposeResolvers<ContextType>;
  Me?: MeResolvers<ContextType>;
  MistakeSentence?: MistakeSentenceResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OnboardingState?: OnboardingStateResolvers<ContextType>;
  OverviewContentCounts?: OverviewContentCountsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  QuestionOption?: QuestionOptionResolvers<ContextType>;
  Quiz?: QuizResolvers<ContextType>;
  QuizAttempt?: QuizAttemptResolvers<ContextType>;
  QuizOption?: QuizOptionResolvers<ContextType>;
  QuizPage?: QuizPageResolvers<ContextType>;
  QuizPaper?: QuizPaperResolvers<ContextType>;
  QuizPaperQuestion?: QuizPaperQuestionResolvers<ContextType>;
  QuizQuestionReview?: QuizQuestionReviewResolvers<ContextType>;
  SpeakingAttempt?: SpeakingAttemptResolvers<ContextType>;
  SpeakingPhonemeScore?: SpeakingPhonemeScoreResolvers<ContextType>;
  SpeakingPrompt?: SpeakingPromptResolvers<ContextType>;
  SpeakingPromptPage?: SpeakingPromptPageResolvers<ContextType>;
  SpeakingUploadTicket?: SpeakingUploadTicketResolvers<ContextType>;
  SpeakingWord?: SpeakingWordResolvers<ContextType>;
  TutorConversation?: TutorConversationResolvers<ContextType>;
  TutorConversationSummary?: TutorConversationSummaryResolvers<ContextType>;
  TutorMessage?: TutorMessageResolvers<ContextType>;
  UserTourStatus?: UserTourStatusResolvers<ContextType>;
}>;

