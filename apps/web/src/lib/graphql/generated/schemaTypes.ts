export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
};

export enum AdjustmentReason {
  AHEAD_OF_SCHEDULE = "AHEAD_OF_SCHEDULE",
  BEHIND_SCHEDULE = "BEHIND_SCHEDULE",
  GOAL_CHANGED = "GOAL_CHANGED",
  LEVEL_REASSESSED = "LEVEL_REASSESSED",
  MILESTONE_FAILED = "MILESTONE_FAILED",
  MILESTONE_PASSED = "MILESTONE_PASSED",
}

/**
 * The administrator's landing page: what is waiting on a decision, how much is
 * live, and whether anyone is using it.
 */
export type AdminOverview = {
  __typename?: "AdminOverview";
  /** Learners who did anything within the period, each counted once. */
  activeLearners: Scalars["Int"]["output"];
  cardReviews: Scalars["Int"]["output"];
  content: Array<OverviewContentCounts>;
  dictationSentences: Scalars["Int"]["output"];
  examsSubmitted: Scalars["Int"]["output"];
  learners: Scalars["Int"]["output"];
  /** Learners who signed up within the period. */
  newLearners: Scalars["Int"]["output"];
  /** Items of every kind waiting on review. */
  pendingReviewTotal: Scalars["Int"]["output"];
  /** Days the activity figures cover. */
  periodDays: Scalars["Int"]["output"];
  quizzesSubmitted: Scalars["Int"]["output"];
};

export type AssessmentAttempt = {
  __typename?: "AssessmentAttempt";
  answerText: Scalars["String"]["output"];
  assessedAt?: Maybe<Scalars["DateTime"]["output"]>;
  audioUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  errorCode?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  learnerId?: Maybe<Scalars["ID"]["output"]>;
  learnerName?: Maybe<Scalars["String"]["output"]>;
  recognizedText?: Maybe<Scalars["String"]["output"]>;
  report?: Maybe<Scalars["String"]["output"]>;
  skill: AssessmentSkill;
  source?: Maybe<Scalars["String"]["output"]>;
  status: AssessmentAttemptStatus;
  submittedAt?: Maybe<Scalars["DateTime"]["output"]>;
  task: AssessmentTask;
  taskId: Scalars["ID"]["output"];
  version: Scalars["Int"]["output"];
  wordCount: Scalars["Int"]["output"];
};

export type AssessmentAttemptPage = {
  __typename?: "AssessmentAttemptPage";
  items: Array<AssessmentAttempt>;
  page: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export enum AssessmentAttemptStatus {
  COMPLETED = "COMPLETED",
  DRAFT = "DRAFT",
  FAILED = "FAILED",
  NEEDS_REVIEW = "NEEDS_REVIEW",
  QUEUED = "QUEUED",
}

export type AssessmentCapabilities = {
  __typename?: "AssessmentCapabilities";
  automaticSpeaking: Scalars["Boolean"]["output"];
  automaticWriting: Scalars["Boolean"]["output"];
  humanReview: Scalars["Boolean"]["output"];
};

export type AssessmentNotification = {
  __typename?: "AssessmentNotification";
  assessedAt: Scalars["DateTime"]["output"];
  attemptId: Scalars["ID"]["output"];
  skill: AssessmentSkill;
  title: Scalars["String"]["output"];
  version: Scalars["Int"]["output"];
};

export type AssessmentNotificationPage = {
  __typename?: "AssessmentNotificationPage";
  items: Array<AssessmentNotification>;
  page: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type AssessmentReview = {
  __typename?: "AssessmentReview";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  note: Scalars["String"]["output"];
  previousReport?: Maybe<Scalars["String"]["output"]>;
  report: Scalars["String"]["output"];
  reviewerId: Scalars["ID"]["output"];
  reviewerName?: Maybe<Scalars["String"]["output"]>;
};

export enum AssessmentSkill {
  SPEAKING = "SPEAKING",
  WRITING = "WRITING",
}

export type AssessmentSubmissionPage = {
  __typename?: "AssessmentSubmissionPage";
  items: Array<AssessmentSubmissionSummary>;
  page: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type AssessmentSubmissionSummary = {
  __typename?: "AssessmentSubmissionSummary";
  id: Scalars["ID"]["output"];
  learnerId: Scalars["ID"]["output"];
  learnerName?: Maybe<Scalars["String"]["output"]>;
  skill: AssessmentSkill;
  status: AssessmentAttemptStatus;
  submittedAt?: Maybe<Scalars["DateTime"]["output"]>;
  task: AssessmentSubmissionTask;
  version: Scalars["Int"]["output"];
};

export type AssessmentSubmissionTask = {
  __typename?: "AssessmentSubmissionTask";
  id: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
};

export type AssessmentTask = {
  __typename?: "AssessmentTask";
  certificateType?: Maybe<CertificateType>;
  id: Scalars["ID"]["output"];
  instructions: Scalars["String"]["output"];
  minimumWords: Scalars["Int"]["output"];
  purpose: AssessmentTaskPurpose;
  reviewNote?: Maybe<Scalars["String"]["output"]>;
  rubricNotes?: Maybe<Scalars["String"]["output"]>;
  sampleAnswer?: Maybe<Scalars["String"]["output"]>;
  skill: AssessmentSkill;
  status: AssessmentTaskStatus;
  targetLevel?: Maybe<CefrLevel>;
  taskType: Scalars["String"]["output"];
  timeLimitSeconds: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
  version: Scalars["Int"]["output"];
};

export type AssessmentTaskInput = {
  /** Set for IELTS/TOEIC preparation; leave empty for general practice. */
  certificateType?: InputMaybe<CertificateType>;
  instructions: Scalars["String"]["input"];
  minimumWords: Scalars["Int"]["input"];
  /**
   * Defaults to PRACTICE. LEVEL_CHECK is refused for a Writing task
   * (TASK_PURPOSE_SKILL).
   */
  purpose?: InputMaybe<AssessmentTaskPurpose>;
  rubricNotes?: InputMaybe<Scalars["String"]["input"]>;
  sampleAnswer?: InputMaybe<Scalars["String"]["input"]>;
  skill: AssessmentSkill;
  targetLevel?: InputMaybe<CefrLevel>;
  taskType: Scalars["String"]["input"];
  timeLimitSeconds: Scalars["Int"]["input"];
  title: Scalars["String"]["input"];
};

export type AssessmentTaskPage = {
  __typename?: "AssessmentTaskPage";
  items: Array<AssessmentTask>;
  page: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export enum AssessmentTaskPurpose {
  /**
   * The spoken part of the roadmap's level check (Speaking only). Kept out of
   * the learner catalogue.
   */
  LEVEL_CHECK = "LEVEL_CHECK",
  PRACTICE = "PRACTICE",
}

export enum AssessmentTaskStatus {
  ARCHIVED = "ARCHIVED",
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
}

export type AssessmentUpload = {
  __typename?: "AssessmentUpload";
  attempt: AssessmentAttempt;
  uploadUrl?: Maybe<Scalars["String"]["output"]>;
};

export type AssessmentWorkload = {
  __typename?: "AssessmentWorkload";
  completed: Scalars["Int"]["output"];
  drafts: Scalars["Int"]["output"];
  failed: Scalars["Int"]["output"];
  needsReview: Scalars["Int"]["output"];
  pendingReview: Scalars["Int"]["output"];
  published: Scalars["Int"]["output"];
  rejected: Scalars["Int"]["output"];
};

export type AttemptOptionReview = {
  __typename?: "AttemptOptionReview";
  correct: Scalars["Boolean"]["output"];
  explanation?: Maybe<Scalars["String"]["output"]>;
  optionId: Scalars["ID"]["output"];
};

/** A part a practice covered. */
export type AttemptPart = {
  __typename?: "AttemptPart";
  id: Scalars["ID"]["output"];
  sectionType?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
};

export type AttemptQuestionReview = {
  __typename?: "AttemptQuestionReview";
  awardedRawScore: Scalars["Float"]["output"];
  correct: Scalars["Boolean"]["output"];
  correctOptionIds: Array<Scalars["ID"]["output"]>;
  explanation?: Maybe<Scalars["String"]["output"]>;
  options: Array<AttemptOptionReview>;
  questionId: Scalars["ID"]["output"];
  selectedOptionIds: Array<Scalars["ID"]["output"]>;
};

export enum CefrLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum CertificateType {
  IELTS = "IELTS",
  TOEIC = "TOEIC",
}

export enum CertificateVariant {
  ACADEMIC = "ACADEMIC",
  GENERAL = "GENERAL",
  LR = "LR",
  SW = "SW",
}

/**
 * The four kinds of authored content. They share one review workflow, so this
 * schema presents one surface over four backend resources rather than four
 * copies of the same six operations.
 */
export enum ContentKind {
  DICTATION_LESSON = "DICTATION_LESSON",
  FLASHCARD_SET = "FLASHCARD_SET",
  QUIZ = "QUIZ",
  SPEAKING_PROMPT = "SPEAKING_PROMPT",
}

/**
 * A piece of content as its author and reviewer see it. Never sent to a learner:
 * it carries the rejection note, and nobody studying should read "rejected
 * because the audio is unusable".
 */
export type ContentReview = {
  __typename?: "ContentReview";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  /**
   * Cards, questions or sentences - whatever this kind is made of. Null for a
   * speaking prompt, which is one sentence rather than a collection: "1 item"
   * would be true and would tell a reviewer nothing.
   */
  itemCount?: Maybe<Scalars["Int"]["output"]>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Why it came back, in the reviewer words. Required when rejecting. */
  reviewNote?: Maybe<Scalars["String"]["output"]>;
  reviewedAt?: Maybe<Scalars["DateTime"]["output"]>;
  reviewedByUserId?: Maybe<Scalars["ID"]["output"]>;
  slug: Scalars["String"]["output"];
  status: ContentStatus;
  submittedForReviewAt?: Maybe<Scalars["DateTime"]["output"]>;
  title: Scalars["String"]["output"];
};

export type ContentReviewPage = {
  __typename?: "ContentReviewPage";
  items: Array<ContentReview>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

/**
 * DRAFT -> PENDING_REVIEW -> PUBLISHED, with REJECTED as the way back. The
 * backend keeps a separate enum per content type; the values are identical by
 * construction and this is what validates them on the wire.
 */
export enum ContentStatus {
  ARCHIVED = "ARCHIVED",
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
}

export type DailyPath = {
  __typename?: "DailyPath";
  level: Scalars["Int"]["output"];
  levelCostXp: Scalars["Int"]["output"];
  quests: Array<DailyQuest>;
  /**
   * The roadmap stage today's work comes from, or null when the learner has no
   * active roadmap and the general rules chose the work.
   */
  roadmapStageTitle?: Maybe<Scalars["String"]["output"]>;
  /** Consecutive days with any practice, counted across every feature. */
  streakDays: Scalars["Int"]["output"];
  tasks: Array<DailyTask>;
  /** Derived from the activity tables on every read. There is no points ledger. */
  totalXp: Scalars["Int"]["output"];
  xpIntoLevel: Scalars["Int"]["output"];
};

export type DailyQuest = {
  __typename?: "DailyQuest";
  completed: Scalars["Boolean"]["output"];
  kind: DailyQuestKind;
  progress: Scalars["Int"]["output"];
  target: Scalars["Int"]["output"];
};

export enum DailyQuestKind {
  PASS_A_QUIZ = "PASS_A_QUIZ",
  PRACTISE_EVERY_DAY = "PRACTISE_EVERY_DAY",
  REVIEW_DUE_CARDS = "REVIEW_DUE_CARDS",
  TYPE_SENTENCES = "TYPE_SENTENCES",
}

export type DailyTask = {
  __typename?: "DailyTask";
  /** How far through it the learner is, or null if they have never opened it. */
  completionPercent?: Maybe<Scalars["Int"]["output"]>;
  kind: DailyTaskKind;
  order: Scalars["Int"]["output"];
  status: DailyTaskStatus;
  /** The set, lesson or quiz to open. The link is built from this and the kind. */
  targetId: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  unitsDoneToday: Scalars["Int"]["output"];
  /** Cards due, sentences left, or questions in the quiz. */
  unitsRemaining: Scalars["Int"]["output"];
  /** What finishing it pays, from the same weights the counter pays from. */
  xpReward: Scalars["Int"]["output"];
};

export enum DailyTaskKind {
  DICTATION = "DICTATION",
  /** Cards the spaced-repetition schedule says are due. */
  FLASHCARD_REVIEW = "FLASHCARD_REVIEW",
  /**
   * The test closing the current roadmap stage. targetId is the milestone; the
   * roadmap page shows how to take it.
   */
  MILESTONE = "MILESTONE",
  /** A pronunciation prompt scheduled by the learner's roadmap. */
  PRONUNCIATION = "PRONUNCIATION",
  QUIZ = "QUIZ",
  SPEAKING = "SPEAKING",
  WRITING = "WRITING",
}

/**
 * There is deliberately no LOCKED. Nothing gates one piece of content behind
 * another, so UPCOMING says "not started" rather than "you may not".
 */
export enum DailyTaskStatus {
  COMPLETED = "COMPLETED",
  CURRENT = "CURRENT",
  UPCOMING = "UPCOMING",
}

export type DictationDailyAccuracy = {
  __typename?: "DictationDailyAccuracy";
  accuracyPercent: Scalars["Int"]["output"];
  attemptCount: Scalars["Int"]["output"];
  day: Scalars["Date"]["output"];
};

export type DictationDifficultSentence = {
  __typename?: "DictationDifficultSentence";
  accuracyPercent: Scalars["Int"]["output"];
  attemptCount: Scalars["Int"]["output"];
  /** The lesson the line belongs to - where its practise button leads. */
  lessonId: Scalars["ID"]["output"];
  sentenceId: Scalars["ID"]["output"];
  text: Scalars["String"]["output"];
  topic: Scalars["String"]["output"];
};

export type DictationLesson = {
  __typename?: "DictationLesson";
  /** Per learner: sentences whose best attempt cleared the completion threshold. */
  completedSentenceCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  lastPractisedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** When the lesson went live; what "newest first" sorts on. */
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  sentenceCount: Scalars["Int"]["output"];
  slug: Scalars["String"]["output"];
  targetLevel?: Maybe<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  topic: Scalars["String"]["output"];
  totalDurationSeconds: Scalars["Int"]["output"];
};

export type DictationLessonDetail = {
  __typename?: "DictationLessonDetail";
  lesson: DictationLesson;
  sentences: Array<DictationSentence>;
};

export type DictationLessonPage = {
  __typename?: "DictationLessonPage";
  items: Array<DictationLesson>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type DictationMissedWord = {
  __typename?: "DictationMissedWord";
  accuracyPercent: Scalars["Int"]["output"];
  correctCount: Scalars["Int"]["output"];
  missedCount: Scalars["Int"]["output"];
  word: Scalars["String"]["output"];
};

/**
 * A sentence as the learner practises it. It carries the transcript so the
 * screen can mark an answer the moment it is typed instead of waiting on a
 * round trip per check. What is recorded is still the server's: a submission
 * is scored again from the stored transcript.
 */
export type DictationSentence = {
  __typename?: "DictationSentence";
  audioDurationSeconds: Scalars["Int"]["output"];
  audioEndMs?: Maybe<Scalars["Int"]["output"]>;
  /**
   * Where this sentence begins inside audioUrl, for a lesson cut from one long
   * recording. Null on both means the file is this sentence and nothing else,
   * which is what a lesson with a clip per line has always meant - so a player
   * that ignores them keeps working on older content.
   */
  audioStartMs?: Maybe<Scalars["Int"]["output"]>;
  /** Pre-signed and short-lived. */
  audioUrl: Scalars["String"]["output"];
  /** The learner's best attempt on this line so far. Null if never tried. */
  bestAccuracyPercent?: Maybe<Scalars["Float"]["output"]>;
  hintFirstLetters?: Maybe<Scalars["String"]["output"]>;
  hintPartialTranscript?: Maybe<Scalars["String"]["output"]>;
  hintRevealWord?: Maybe<Scalars["String"]["output"]>;
  /** Counted by the same scorer that marks the answer, so the two agree. */
  hintWordCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  orderNo: Scalars["Int"]["output"];
  /** What is said in the audio, for marking an answer in the browser. */
  text: Scalars["String"]["output"];
  /** The Vietnamese meaning, shown with the result. */
  translationVi?: Maybe<Scalars["String"]["output"]>;
};

export type DictationSessionSummary = {
  __typename?: "DictationSessionSummary";
  accuracyPercent: Scalars["Int"]["output"];
  day: Scalars["Date"]["output"];
  lessonId: Scalars["ID"]["output"];
  lessonTitle: Scalars["String"]["output"];
  listeningSeconds: Scalars["Int"]["output"];
  sentenceCount: Scalars["Int"]["output"];
};

export type DictationStats = {
  __typename?: "DictationStats";
  activity: Array<DictationDailyAccuracy>;
  averageAccuracyPercent: Scalars["Int"]["output"];
  difficultSentences: Array<DictationDifficultSentence>;
  history: Array<DictationSessionSummary>;
  lessonsCompleted: Scalars["Int"]["output"];
  listeningSeconds: Scalars["Int"]["output"];
  /**
   * Recomputed from recent answers rather than stored - ordered by accuracy, so
   * a word missed twice out of two ranks above one missed three times in thirty.
   */
  missedWords: Array<DictationMissedWord>;
  periodDays: Scalars["Int"]["output"];
  sentencesPractised: Scalars["Int"]["output"];
  streakDays: Scalars["Int"]["output"];
};

/** The only type that carries the transcript. */
export type DictationSubmission = {
  __typename?: "DictationSubmission";
  accuracyPercent: Scalars["Float"]["output"];
  /**
   * Whether the line now counts as done, by the server's one rule. Sent so no
   * screen compares the accuracy to a threshold of its own.
   */
  cleared: Scalars["Boolean"]["output"];
  correctText: Scalars["String"]["output"];
  correctWordCount: Scalars["Int"]["output"];
  response: Scalars["String"]["output"];
  sentenceId: Scalars["ID"]["output"];
  totalWordCount: Scalars["Int"]["output"];
  translationVi?: Maybe<Scalars["String"]["output"]>;
};

/** The full paper shell returned by create, update, publish and archive. */
export type Exam = {
  __typename?: "Exam";
  certificateType?: Maybe<CertificateType>;
  certificateVariant?: Maybe<CertificateVariant>;
  createdByUserId: Scalars["ID"]["output"];
  description: Scalars["String"]["output"];
  durationSeconds: Scalars["Int"]["output"];
  examType: ExamType;
  id: Scalars["ID"]["output"];
  maxRawScore: Scalars["Float"]["output"];
  passScore?: Maybe<Scalars["Float"]["output"]>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  reviewNote?: Maybe<Scalars["String"]["output"]>;
  reviewedAt?: Maybe<Scalars["DateTime"]["output"]>;
  reviewedByUserId?: Maybe<Scalars["ID"]["output"]>;
  status: ExamStatus;
  submittedForReviewAt?: Maybe<Scalars["DateTime"]["output"]>;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars["String"]["output"];
  versionNumber: Scalars["Int"]["output"];
};

export type ExamAttempt = {
  __typename?: "ExamAttempt";
  correctAnswerCount?: Maybe<Scalars["Int"]["output"]>;
  examId: Scalars["ID"]["output"];
  /** Null except on a history row - a sitting knows its own paper's name. */
  examTitle?: Maybe<Scalars["String"]["output"]>;
  /**
   * The deadline the backend issued. This is the only authority on remaining
   * time - a countdown from durationSeconds drifts across a sleeping laptop.
   */
  expiresAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  maxRawScore: Scalars["Float"]["output"];
  mode: ExamAttemptMode;
  /** Parts a practice covers; empty for a full attempt. */
  parts: Array<AttemptPart>;
  questionCount: Scalars["Int"]["output"];
  /** Empty while the attempt is IN_PROGRESS - it carries the answer key. */
  questions: Array<AttemptQuestionReview>;
  /** Null until the attempt is scored. */
  rawScore?: Maybe<Scalars["Float"]["output"]>;
  /** True when the backend handed back an attempt that was already open. */
  resumed: Scalars["Boolean"]["output"];
  scorePercentage?: Maybe<Scalars["Float"]["output"]>;
  scoredAt?: Maybe<Scalars["DateTime"]["output"]>;
  startedAt: Scalars["DateTime"]["output"];
  status: ExamAttemptStatus;
  submittedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /**
   * Null only for an untimed practice; expiresAt is then a far safety net and
   * the client shows no countdown.
   */
  timeLimitSeconds?: Maybe<Scalars["Int"]["output"]>;
};

/**
 * FULL is the real sitting: every part on the paper's own clock, and the only
 * mode that counts toward progress, the best score and placement. PRACTICE
 * covers chosen parts on a clock the learner picked, or none.
 */
export enum ExamAttemptMode {
  FULL = "FULL",
  PRACTICE = "PRACTICE",
}

export type ExamAttemptPage = {
  __typename?: "ExamAttemptPage";
  items: Array<ExamAttempt>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export enum ExamAttemptStatus {
  EXPIRED = "EXPIRED",
  IN_PROGRESS = "IN_PROGRESS",
  SCORED = "SCORED",
}

export type ExamDraft = {
  __typename?: "ExamDraft";
  answers: Array<ExamDraftAnswer>;
  savedAt: Scalars["DateTime"]["output"];
  version: Scalars["Int"]["output"];
};

export type ExamDraftAnswer = {
  __typename?: "ExamDraftAnswer";
  questionId: Scalars["ID"]["output"];
  selectedOptionIds: Array<Scalars["ID"]["output"]>;
};

export type ExamListItem = {
  __typename?: "ExamListItem";
  /**
   * Null on a paper with no certificate (e.g. a PLACEMENT exam) - the backend
   * allows that combination, so this cannot be non-null.
   */
  certificateType?: Maybe<CertificateType>;
  certificateVariant?: Maybe<CertificateVariant>;
  createdAt: Scalars["DateTime"]["output"];
  createdByUserId: Scalars["ID"]["output"];
  examType: ExamType;
  id: Scalars["ID"]["output"];
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /**
   * Why the paper came back, in the reviewer words. On the list rather than only
   * on the detail screen: this is where an author finds out and what to change.
   */
  reviewNote?: Maybe<Scalars["String"]["output"]>;
  status: ExamStatus;
  submittedForReviewAt?: Maybe<Scalars["DateTime"]["output"]>;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars["String"]["output"];
  versionNumber: Scalars["Int"]["output"];
};

export type ExamOutline = {
  __typename?: "ExamOutline";
  examId: Scalars["ID"]["output"];
  sections: Array<ExamOutlineSection>;
};

export type ExamOutlinePart = {
  __typename?: "ExamOutlinePart";
  id: Scalars["ID"]["output"];
  orderNo: Scalars["Int"]["output"];
  questionCount: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
};

export type ExamOutlineSection = {
  __typename?: "ExamOutlineSection";
  id: Scalars["ID"]["output"];
  orderNo: Scalars["Int"]["output"];
  parts: Array<ExamOutlinePart>;
  sectionType: Scalars["String"]["output"];
};

export type ExamPage = {
  __typename?: "ExamPage";
  items: Array<ExamListItem>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type ExamPaper = {
  __typename?: "ExamPaper";
  certificateType?: Maybe<CertificateType>;
  certificateVariant?: Maybe<CertificateVariant>;
  description: Scalars["String"]["output"];
  durationSeconds: Scalars["Int"]["output"];
  examType: ExamType;
  id: Scalars["ID"]["output"];
  maxRawScore: Scalars["Float"]["output"];
  passScore?: Maybe<Scalars["Float"]["output"]>;
  sections: Array<ExamSectionDetail>;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars["String"]["output"];
  versionNumber: Scalars["Int"]["output"];
};

export type ExamQuestion = {
  __typename?: "ExamQuestion";
  content: Scalars["String"]["output"];
  difficultyLevel: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  maxRawScore: Scalars["Float"]["output"];
  options: Array<QuestionOption>;
  orderNo: Scalars["Int"]["output"];
  questionCategory?: Maybe<Scalars["String"]["output"]>;
  questionType: Scalars["String"]["output"];
  skillType: Scalars["String"]["output"];
};

export type ExamQuestionSet = {
  __typename?: "ExamQuestionSet";
  /** Pre-signed and short-lived - the backend resolves the object key for us. */
  audioUrl?: Maybe<Scalars["String"]["output"]>;
  content?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  instruction?: Maybe<Scalars["String"]["output"]>;
  orderNo: Scalars["Int"]["output"];
  questions: Array<ExamQuestion>;
  title?: Maybe<Scalars["String"]["output"]>;
};

export type ExamSectionDetail = {
  __typename?: "ExamSectionDetail";
  id: Scalars["ID"]["output"];
  maxRawScore: Scalars["Float"]["output"];
  orderNo: Scalars["Int"]["output"];
  parts: Array<ExamSectionPart>;
  scoredByCriteria: Scalars["Boolean"]["output"];
  sectionType: Scalars["String"]["output"];
  timeLimitSeconds?: Maybe<Scalars["Int"]["output"]>;
};

export type ExamSectionPart = {
  __typename?: "ExamSectionPart";
  audioUrl?: Maybe<Scalars["String"]["output"]>;
  content?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  instruction?: Maybe<Scalars["String"]["output"]>;
  orderNo: Scalars["Int"]["output"];
  questionSets: Array<ExamQuestionSet>;
  title: Scalars["String"]["output"];
};

/**
 * How the learner catalogue is ordered, applied to the whole catalogue before
 * it is cut into pages. Papers that tie come out as a numbered series
 * ("Test 2" before "Test 10").
 */
export enum ExamSortBy {
  LEVEL_ASC = "LEVEL_ASC",
  LEVEL_DESC = "LEVEL_DESC",
  NEWEST = "NEWEST",
  SCORE_DESC = "SCORE_DESC",
}

/**
 * DRAFT -> PENDING_REVIEW -> PUBLISHED, with REJECTED as the way back. There is
 * no locked-style dead end: a rejected paper is editable, or its author could
 * never answer the note.
 */
export enum ExamStatus {
  ARCHIVED = "ARCHIVED",
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
}

export enum ExamType {
  /**
   * The written part of the roadmap's level check: vocabulary and grammar in
   * its READING section, plus LISTENING. Taken in full only, and kept out of
   * the learner catalogue.
   */
  LEVEL_CHECK = "LEVEL_CHECK",
  MOCK = "MOCK",
  PLACEMENT = "PLACEMENT",
}

export type Flashcard = {
  __typename?: "Flashcard";
  audioUkUrl?: Maybe<Scalars["String"]["output"]>;
  /** Pre-signed and short-lived - the backend resolves the object key. */
  audioUsUrl?: Maybe<Scalars["String"]["output"]>;
  cefrLevel?: Maybe<Scalars["String"]["output"]>;
  definitionEn: Scalars["String"]["output"];
  definitionVi: Scalars["String"]["output"];
  /** Null for a card the learner has never answered. */
  dueAt?: Maybe<Scalars["DateTime"]["output"]>;
  exampleSentence: Scalars["String"]["output"];
  exampleTranslationVi?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  ipaUk?: Maybe<Scalars["String"]["output"]>;
  ipaUs: Scalars["String"]["output"];
  lapseCount: Scalars["Int"]["output"];
  lemma: Scalars["String"]["output"];
  mnemonicTipVi?: Maybe<Scalars["String"]["output"]>;
  orderNo: Scalars["Int"]["output"];
  partOfSpeech: Scalars["String"]["output"];
  /** Which sense the card teaches - "bank (river)" is not "bank (money)". */
  senseLabel: Scalars["String"]["output"];
  status: FlashcardReviewStatus;
};

export type FlashcardCatalogueInfo = {
  __typename?: "FlashcardCatalogueInfo";
  topics: Array<Scalars["String"]["output"]>;
  totalDueCount: Scalars["Int"]["output"];
};

export type FlashcardDailyActivity = {
  __typename?: "FlashcardDailyActivity";
  cardCount: Scalars["Int"]["output"];
  day: Scalars["Date"]["output"];
};

export type FlashcardDifficultCard = {
  __typename?: "FlashcardDifficultCard";
  flashcardId: Scalars["ID"]["output"];
  /**
   * Times the card was lost after having been learned. Not the same as times
   * failed: failing a card still being learned is ordinary progress.
   */
  lapseCount: Scalars["Int"]["output"];
  lastReviewed?: Maybe<Scalars["DateTime"]["output"]>;
  lemma: Scalars["String"]["output"];
  setName: Scalars["String"]["output"];
};

export type FlashcardReview = {
  __typename?: "FlashcardReview";
  dueAt: Scalars["DateTime"]["output"];
  flashcardId: Scalars["ID"]["output"];
  intervalDays: Scalars["Int"]["output"];
  lapseCount: Scalars["Int"]["output"];
  repetitions: Scalars["Int"]["output"];
  status: FlashcardReviewStatus;
};

export enum FlashcardReviewStatus {
  LEARNING = "LEARNING",
  MASTERED = "MASTERED",
  NEW = "NEW",
  REVIEW = "REVIEW",
}

export type FlashcardSessionSummary = {
  __typename?: "FlashcardSessionSummary";
  cardCount: Scalars["Int"]["output"];
  day: Scalars["Date"]["output"];
  recallPercent: Scalars["Int"]["output"];
  setId: Scalars["ID"]["output"];
  setName: Scalars["String"]["output"];
  studySeconds: Scalars["Int"]["output"];
};

export type FlashcardSet = {
  __typename?: "FlashcardSet";
  cardCount: Scalars["Int"]["output"];
  description: Scalars["String"]["output"];
  /**
   * Per learner, not per set: two learners looking at the same set see
   * different numbers, which is why these are not fields of the set itself.
   */
  dueCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  /** Null until the learner has answered a card in this set. */
  lastStudiedAt?: Maybe<Scalars["DateTime"]["output"]>;
  masteredCount: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
  /** Null on a set that deliberately mixes levels. */
  targetLevel?: Maybe<Scalars["String"]["output"]>;
  topic: Scalars["String"]["output"];
};

export type FlashcardSetDetail = {
  __typename?: "FlashcardSetDetail";
  cards: Array<Flashcard>;
  page: Scalars["Int"]["output"];
  set: FlashcardSet;
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type FlashcardSetPage = {
  __typename?: "FlashcardSetPage";
  items: Array<FlashcardSet>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type FlashcardStats = {
  __typename?: "FlashcardStats";
  activity: Array<FlashcardDailyActivity>;
  cardsStudied: Scalars["Int"]["output"];
  difficultCards: Array<FlashcardDifficultCard>;
  history: Array<FlashcardSessionSummary>;
  periodDays: Scalars["Int"]["output"];
  retentionPercent: Scalars["Int"]["output"];
  /** Counted over a year, not the period - a 7-day view still shows a 40-day streak. */
  streakDays: Scalars["Int"]["output"];
  studySeconds: Scalars["Int"]["output"];
};

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHER = "OTHER",
}

export enum LearnerAttemptStatus {
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  NOT_STARTED = "NOT_STARTED",
}

export type LearnerExamItem = {
  __typename?: "LearnerExamItem";
  attemptStatus: LearnerAttemptStatus;
  /** Per learner. Null until they have finished a sitting. */
  bestScorePercentage?: Maybe<Scalars["Float"]["output"]>;
  certificateType?: Maybe<CertificateType>;
  certificateVariant?: Maybe<CertificateVariant>;
  description: Scalars["String"]["output"];
  durationSeconds: Scalars["Int"]["output"];
  examType: ExamType;
  id: Scalars["ID"]["output"];
  maxRawScore: Scalars["Float"]["output"];
  passScore?: Maybe<Scalars["Float"]["output"]>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  questionCount: Scalars["Int"]["output"];
  status: ExamStatus;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars["String"]["output"];
};

export type LearnerExamPage = {
  __typename?: "LearnerExamPage";
  items: Array<LearnerExamItem>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type LearningGoalInput = {
  certificateType: TargetCertificate;
  /**
   * Minutes a day the learner means to study, 10-240. The roadmap plans each
   * week within it.
   */
  dailyStudyMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  targetDate?: InputMaybe<Scalars["Date"]["input"]>;
  /**
   * Only a learner without a certificate goal may send this, and it must be
   * above their current level (TARGET_LEVEL_NOT_ABOVE_CURRENT otherwise).
   */
  targetLevel?: InputMaybe<CefrLevel>;
  /** Only a certificate learner may send this - the backend refuses it otherwise. */
  targetScore?: InputMaybe<Scalars["Float"]["input"]>;
};

export type LearningPurpose = {
  __typename?: "LearningPurpose";
  displayName: Scalars["String"]["output"];
  id: Scalars["Int"]["output"];
  purposeCode: Scalars["String"]["output"];
};

export enum LearningSkill {
  GRAMMAR = "GRAMMAR",
  LISTENING = "LISTENING",
  PRONUNCIATION = "PRONUNCIATION",
  READING = "READING",
  SPEAKING = "SPEAKING",
  VOCABULARY = "VOCABULARY",
  WRITING = "WRITING",
}

export type LevelCheck = {
  __typename?: "LevelCheck";
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  examAttemptId?: Maybe<Scalars["ID"]["output"]>;
  /** The paper to sit (vocabulary/grammar and listening), through the exam screens. */
  examId: Scalars["ID"]["output"];
  id: Scalars["ID"]["output"];
  listeningLevel?: Maybe<CefrLevel>;
  milestoneId?: Maybe<Scalars["ID"]["output"]>;
  /** The band from the written parts alone while the spoken part is outstanding. */
  provisionalLevel?: Maybe<CefrLevel>;
  purpose: LevelCheckPurpose;
  resultLevel?: Maybe<CefrLevel>;
  speakingAttemptId?: Maybe<Scalars["ID"]["output"]>;
  /** The spoken answer could not be graded; answer again or skip it. */
  speakingFailed: Scalars["Boolean"]["output"];
  speakingLevel?: Maybe<CefrLevel>;
  speakingSkipped: Scalars["Boolean"]["output"];
  /** The spoken task to answer; null when none is published. */
  speakingTaskId?: Maybe<Scalars["ID"]["output"]>;
  status: LevelCheckStatus;
  vocabLevel?: Maybe<CefrLevel>;
};

export enum LevelCheckPurpose {
  /** The test closing a stage of a level roadmap. */
  MILESTONE = "MILESTONE",
  /** The starting level of a learner without a certificate goal. */
  ONBOARDING = "ONBOARDING",
}

export enum LevelCheckStatus {
  /** The paper is scored; the spoken answer is not graded yet, or not given. */
  AWAITING_SPEAKING = "AWAITING_SPEAKING",
  COMPLETED = "COMPLETED",
  /** The paper is not scored yet. */
  IN_PROGRESS = "IN_PROGRESS",
}

export type LevelCheckWeightChange = {
  __typename?: "LevelCheckWeightChange";
  /** Who set it; null for the seeded defaults. */
  changedBy?: Maybe<Scalars["String"]["output"]>;
  effectiveFrom: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  listening: Scalars["Int"]["output"];
  priority: Scalars["Int"]["output"];
  purposeCode: Scalars["String"]["output"];
  speaking: Scalars["Int"]["output"];
  vocabulary: Scalars["Int"]["output"];
};

export type LevelCheckWeightInput = {
  listening: Scalars["Int"]["input"];
  /** Among a learner's purposes, the highest priority decides. 0-100. */
  priority: Scalars["Int"]["input"];
  purposeCode: Scalars["String"]["input"];
  speaking: Scalars["Int"]["input"];
  vocabulary: Scalars["Int"]["input"];
};

export type LevelCheckWeightPurpose = {
  __typename?: "LevelCheckWeightPurpose";
  /** The purpose's name as learners see it; null for DEFAULT. */
  displayName?: Maybe<Scalars["String"]["output"]>;
  /** The purpose's own weights in force now; null when it falls back to DEFAULT. */
  inForce?: Maybe<LevelCheckWeightChange>;
  /** DEFAULT, or a learning purpose code. */
  purposeCode: Scalars["String"]["output"];
};

export type LevelCheckWeights = {
  __typename?: "LevelCheckWeights";
  /** The latest changes, newest first. */
  history: Array<LevelCheckWeightChange>;
  purposes: Array<LevelCheckWeightPurpose>;
};

export type Me = {
  __typename?: "Me";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  bannerUrl?: Maybe<Scalars["String"]["output"]>;
  birthDate?: Maybe<Scalars["Date"]["output"]>;
  displayName: Scalars["String"]["output"];
  email: Scalars["String"]["output"];
  fullName: Scalars["String"]["output"];
  gender?: Maybe<Gender>;
  id: Scalars["ID"]["output"];
  onboardingState?: Maybe<OnboardingState>;
  onboardingStep: OnboardingStep;
  role: Role;
};

export enum MilestoneKind {
  /** Sit examId and reach requiredScore on the certificate scale. */
  CERTIFICATE_MOCK = "CERTIFICATE_MOCK",
  /** Take a level check and reach requiredLevel. */
  LEVEL_CHECK = "LEVEL_CHECK",
}

export enum MilestoneStatus {
  /** The last attempt fell short; it can be taken again. */
  FAILED = "FAILED",
  PASSED = "PASSED",
  PENDING = "PENDING",
}

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
  __typename?: "MistakeSentence";
  attemptCount: Scalars["Int"]["output"];
  audioDurationSeconds: Scalars["Int"]["output"];
  audioEndMs?: Maybe<Scalars["Int"]["output"]>;
  /** Where the line sits inside audioUrl, for a lesson cut from one passage. */
  audioStartMs?: Maybe<Scalars["Int"]["output"]>;
  /** Pre-signed and short-lived. */
  audioUrl: Scalars["String"]["output"];
  /** Their best attempt so far - the reason this line is still in the queue. */
  bestAccuracyPercent: Scalars["Int"]["output"];
  /** The last thing they typed, so the screen can show what changed. */
  lastResponse?: Maybe<Scalars["String"]["output"]>;
  lessonId: Scalars["ID"]["output"];
  lessonTitle: Scalars["String"]["output"];
  sentenceId: Scalars["ID"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  _empty?: Maybe<Scalars["Boolean"]["output"]>;
  abandonRoadmap: Scalars["Boolean"]["output"];
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
  attachLevelCheckExamAttempt: LevelCheck;
  attachLevelCheckSpeakingAttempt: LevelCheck;
  branchTutorConversation: TutorConversation;
  cancelTutorReply: TutorMessage;
  clearTutorMemory: Scalars["Boolean"]["output"];
  completeMyTour: UserTourStatus;
  /**
   * Final step. Refuses with ONBOARDING_PURPOSE_REQUIRED,
   * ONBOARDING_LEVEL_REQUIRED or ONBOARDING_CERTIFICATE_TARGET_REQUIRED when an
   * earlier step is missing.
   */
  completeOnboarding: OnboardingState;
  createAssessmentTask: AssessmentTask;
  /**
   * A plan for the learner's current goal. The same goal returns the same plan;
   * a changed score, level or date adjusts it; a different goal replaces it.
   * Refuses with ROADMAP_LEVEL_UNKNOWN or ROADMAP_GOAL_INCOMPLETE before
   * onboarding has a level and a goal, ROADMAP_NO_CONTENT when nothing is
   * published to plan with, and ROADMAP_DAILY_LIMIT after five a day.
   */
  createRoadmap: Roadmap;
  createTutorResource: TutorResource;
  editAssessmentTask: AssessmentTask;
  gradeAssessment: AssessmentAttempt;
  /**
   * The browser is still on a full sitting. Returns whether the sitting is still
   * open: a sitting nobody has reported on for a couple of minutes is ended by
   * the backend, and a screen that was away learns that here.
   */
  heartbeatExamAttempt: Scalars["Boolean"]["output"];
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
  readAssessmentResult: Scalars["Boolean"]["output"];
  /** A finished sitting of the current stage's mock paper. */
  recordMilestoneSitting: Roadmap;
  regenerateTutorReply: TutorConversation;
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
  renameTutorConversation: TutorConversationSummary;
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
  restoreTutorConversation: TutorConversationSummary;
  retryAssessment: AssessmentAttempt;
  retryTutorReply: TutorConversation;
  reviewTutorReport: TutorReport;
  reviewTutorResource: TutorResource;
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
  selectTutorReply: TutorConversation;
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
  /**
   * New weights for one purpose, in force from now; checks already completed
   * keep theirs. Refuses with LEVEL_CHECK_WEIGHTS_INVALID unless the three add
   * up to 100 with something on the written side, and LEVEL_CHECK_PURPOSE_UNKNOWN
   * for a purpose that does not exist. Administrator only.
   */
  setLevelCheckWeight: LevelCheckWeights;
  skipLevelCheckSpeaking: LevelCheck;
  startAssessment: AssessmentUpload;
  /**
   * Opens an attempt, or returns the one already open with resumed: true. The
   * backend enforces one live attempt per learner, exam and mode, so calling this
   * twice does not create two.
   */
  startExamAttempt: ExamAttempt;
  /** Starts a check, or returns the one already open for the same purpose. */
  startLevelCheck: LevelCheck;
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
  summarizeTutorConversation: TutorConversation;
  transitionAssessmentTask: AssessmentTask;
  updateProfile: Me;
  updateTutorPolicy: TutorPolicy;
  updateTutorResource: TutorResource;
};

export type MutationApproveContentArgs = {
  id: Scalars["ID"]["input"];
  kind: ContentKind;
};

export type MutationApproveExamArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationArchiveContentArgs = {
  id: Scalars["ID"]["input"];
  kind: ContentKind;
};

export type MutationArchiveExamArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationArchiveTutorConversationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationAttachLevelCheckExamAttemptArgs = {
  attemptId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
};

export type MutationAttachLevelCheckSpeakingAttemptArgs = {
  attemptId: Scalars["ID"]["input"];
  id: Scalars["ID"]["input"];
};

export type MutationBranchTutorConversationArgs = {
  clientMessageId: Scalars["ID"]["input"];
  conversationId: Scalars["ID"]["input"];
  message: Scalars["String"]["input"];
  messageId: Scalars["ID"]["input"];
  personalized?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationCancelTutorReplyArgs = {
  conversationId: Scalars["ID"]["input"];
  messageId: Scalars["ID"]["input"];
};

export type MutationClearTutorMemoryArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type MutationCreateAssessmentTaskArgs = {
  input: AssessmentTaskInput;
};

export type MutationCreateTutorResourceArgs = {
  input: TutorResourceInput;
};

export type MutationEditAssessmentTaskArgs = {
  id: Scalars["ID"]["input"];
  input: AssessmentTaskInput;
  version: Scalars["Int"]["input"];
};

export type MutationGradeAssessmentArgs = {
  id: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
  report: Scalars["String"]["input"];
  transcript?: InputMaybe<Scalars["String"]["input"]>;
  version: Scalars["Int"]["input"];
};

export type MutationHeartbeatExamAttemptArgs = {
  attemptId: Scalars["ID"]["input"];
};

export type MutationPublishContentArgs = {
  id: Scalars["ID"]["input"];
  kind: ContentKind;
};

export type MutationPublishExamArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRateFlashcardArgs = {
  flashcardId: Scalars["ID"]["input"];
  rating: ReviewRating;
  timeSpentSeconds: Scalars["Int"]["input"];
};

export type MutationReadAssessmentResultArgs = {
  id: Scalars["ID"]["input"];
  version: Scalars["Int"]["input"];
};

export type MutationRecordMilestoneSittingArgs = {
  examAttemptId: Scalars["ID"]["input"];
  milestoneId: Scalars["ID"]["input"];
};

export type MutationRegenerateTutorReplyArgs = {
  clientMessageId: Scalars["ID"]["input"];
  conversationId: Scalars["ID"]["input"];
  messageId: Scalars["ID"]["input"];
};

export type MutationRejectContentArgs = {
  id: Scalars["ID"]["input"];
  kind: ContentKind;
  note: Scalars["String"]["input"];
};

export type MutationRejectExamArgs = {
  id: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
};

export type MutationRenameTutorConversationArgs = {
  id: Scalars["ID"]["input"];
  title: Scalars["String"]["input"];
};

export type MutationReportTutorMessageArgs = {
  conversationId: Scalars["ID"]["input"];
  messageId: Scalars["ID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationRequestAssessmentReviewArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRestoreContentArgs = {
  id: Scalars["ID"]["input"];
  kind: ContentKind;
};

export type MutationRestoreExamArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRestoreTutorConversationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRetryAssessmentArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRetryTutorReplyArgs = {
  clientMessageId: Scalars["ID"]["input"];
  conversationId: Scalars["ID"]["input"];
  messageId: Scalars["ID"]["input"];
};

export type MutationReviewTutorReportArgs = {
  id: Scalars["ID"]["input"];
  input: TutorReviewInput;
};

export type MutationReviewTutorResourceArgs = {
  id: Scalars["ID"]["input"];
  input: TutorReviewInput;
};

export type MutationSaveAssessmentDraftArgs = {
  answerText: Scalars["String"]["input"];
  id: Scalars["ID"]["input"];
  version: Scalars["Int"]["input"];
};

export type MutationSaveExamDraftArgs = {
  answers: Array<SubmitAnswerInput>;
  attemptId: Scalars["ID"]["input"];
  version: Scalars["Int"]["input"];
};

export type MutationSelectLearningPurposesArgs = {
  purposeIds: Array<Scalars["Int"]["input"]>;
};

export type MutationSelectTargetSkillsArgs = {
  skills: Array<LearningSkill>;
};

export type MutationSelectTutorReplyArgs = {
  clientMessageId: Scalars["ID"]["input"];
  conversationId: Scalars["ID"]["input"];
  messageId: Scalars["ID"]["input"];
  revision: Scalars["Int"]["input"];
};

export type MutationSendTutorMessageArgs = {
  assessmentAttemptId?: InputMaybe<Scalars["ID"]["input"]>;
  clientMessageId?: InputMaybe<Scalars["ID"]["input"]>;
  conversationId?: InputMaybe<Scalars["ID"]["input"]>;
  examAttemptId?: InputMaybe<Scalars["ID"]["input"]>;
  examQuestionId?: InputMaybe<Scalars["ID"]["input"]>;
  message: Scalars["String"]["input"];
  mode?: InputMaybe<Scalars["String"]["input"]>;
  personalized?: InputMaybe<Scalars["Boolean"]["input"]>;
  quizAttemptId?: InputMaybe<Scalars["ID"]["input"]>;
  quizQuestionId?: InputMaybe<Scalars["ID"]["input"]>;
  topic?: InputMaybe<Scalars["String"]["input"]>;
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

export type MutationSetLevelCheckWeightArgs = {
  input: LevelCheckWeightInput;
};

export type MutationSkipLevelCheckSpeakingArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationStartAssessmentArgs = {
  clientKey: Scalars["ID"]["input"];
  contentLength?: InputMaybe<Scalars["Int"]["input"]>;
  contentType?: InputMaybe<Scalars["String"]["input"]>;
  taskId: Scalars["ID"]["input"];
};

export type MutationStartExamAttemptArgs = {
  examId: Scalars["ID"]["input"];
  input?: InputMaybe<StartExamAttemptInput>;
};

export type MutationStartLevelCheckArgs = {
  milestoneId?: InputMaybe<Scalars["ID"]["input"]>;
  purpose: LevelCheckPurpose;
};

export type MutationStartQuizAttemptArgs = {
  quizId: Scalars["ID"]["input"];
};

export type MutationStartSpeakingAttemptArgs = {
  contentLength: Scalars["Int"]["input"];
  contentType: Scalars["String"]["input"];
  promptId: Scalars["ID"]["input"];
};

export type MutationSubmitAssessmentArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationSubmitContentForReviewArgs = {
  id: Scalars["ID"]["input"];
  kind: ContentKind;
};

export type MutationSubmitDictationArgs = {
  response: Scalars["String"]["input"];
  sentenceId: Scalars["ID"]["input"];
};

export type MutationSubmitExamAttemptArgs = {
  answers: Array<SubmitAnswerInput>;
  attemptId: Scalars["ID"]["input"];
};

export type MutationSubmitExamForReviewArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationSubmitQuizAttemptArgs = {
  answers: Array<QuizAnswerInput>;
  attemptId: Scalars["ID"]["input"];
};

export type MutationSubmitSpeakingAttemptArgs = {
  attemptId: Scalars["ID"]["input"];
};

export type MutationSummarizeTutorConversationArgs = {
  clientMessageId: Scalars["ID"]["input"];
  conversationId: Scalars["ID"]["input"];
};

export type MutationTransitionAssessmentTaskArgs = {
  action: Scalars["String"]["input"];
  id: Scalars["ID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type MutationUpdateTutorPolicyArgs = {
  input: TutorPolicyInput;
};

export type MutationUpdateTutorResourceArgs = {
  id: Scalars["ID"]["input"];
  input: TutorResourceInput;
};

export type OnboardingState = {
  __typename?: "OnboardingState";
  certificateLearner: Scalars["Boolean"]["output"];
  currentLevel?: Maybe<CefrLevel>;
  dailyStudyMinutes?: Maybe<Scalars["Int"]["output"]>;
  learningPurposeIds: Array<Scalars["Int"]["output"]>;
  /**
   * The step after this write. Every onboarding write answers with it, so the
   * client can move to the next screen without reading Me again.
   */
  step: OnboardingStep;
  targetCertificateType?: Maybe<Scalars["String"]["output"]>;
  targetDate?: Maybe<Scalars["Date"]["output"]>;
  /** The CEFR level a learner without a certificate goal is aiming for. */
  targetLevel?: Maybe<CefrLevel>;
  targetScore?: Maybe<Scalars["Float"]["output"]>;
  targetSkills: Array<LearningSkill>;
};

export enum OnboardingStep {
  CERTIFICATE_TARGET = "CERTIFICATE_TARGET",
  COMPLETED = "COMPLETED",
  CURRENT_LEVEL = "CURRENT_LEVEL",
  LEARNING_GOAL = "LEARNING_GOAL",
  LEARNING_PURPOSES = "LEARNING_PURPOSES",
  TARGET_SKILLS = "TARGET_SKILLS",
}

/** What to do when another attempt at this exam is already open. */
export enum OpenAttemptChoice {
  /** Finalize the open attempt from its saved answers, then start the new one. */
  REPLACE = "REPLACE",
  /** Keep the open attempt and return it. */
  RESUME = "RESUME",
}

export type OverviewContentCounts = {
  __typename?: "OverviewContentCounts";
  drafts: Scalars["Int"]["output"];
  kind: OverviewContentKind;
  pendingReview: Scalars["Int"]["output"];
  published: Scalars["Int"]["output"];
};

/** Everything the overview counts: the four kinds of authored content, and exams. */
export enum OverviewContentKind {
  DICTATION_LESSON = "DICTATION_LESSON",
  EXAM = "EXAM",
  FLASHCARD_SET = "FLASHCARD_SET",
  QUIZ = "QUIZ",
  SPEAKING_ASSESSMENT = "SPEAKING_ASSESSMENT",
  SPEAKING_PROMPT = "SPEAKING_PROMPT",
  WRITING_ASSESSMENT = "WRITING_ASSESSMENT",
}

export type Query = {
  __typename?: "Query";
  activeExamAttempt?: Maybe<ExamAttempt>;
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
  /**
   * The paper's skills and parts with how many questions each holds - what a
   * practice is picked from. No question content.
   */
  examOutline: ExamOutline;
  /** Learner exam catalogue search - returns published exams. */
  exams: LearnerExamPage;
  flashcardCatalogueInfo: FlashcardCatalogueInfo;
  flashcardSet: FlashcardSetDetail;
  flashcardSetSummary: FlashcardSet;
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
  health: Scalars["String"]["output"];
  /** The learner's most recent level check, or null. */
  latestLevelCheck?: Maybe<LevelCheck>;
  learningPurposes: Array<LearningPurpose>;
  /** Reading a check picks up any grade that arrived since the last look. */
  levelCheck: LevelCheck;
  /**
   * How the level check's parts are weighted, by learning purpose.
   * Administrator only (FORBIDDEN otherwise).
   */
  levelCheckWeights: LevelCheckWeights;
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
  /**
   * The plan in play, else the newest one (failed or finished), else null.
   * Reading it can start an automatic replan when the learner is a week behind.
   */
  roadmap?: Maybe<Roadmap>;
  /** What the screen polls while it waits for a score. */
  speakingAttempt: SpeakingAttempt;
  /** This learner's own attempts at one prompt, newest first. No word breakdown. */
  speakingAttempts: Array<SpeakingAttempt>;
  speakingPrompt: SpeakingPrompt;
  speakingPrompts: SpeakingPromptPage;
  tutorConversation: TutorConversation;
  tutorConversations: Array<TutorConversationSummary>;
  tutorHistory: TutorHistoryPage;
  tutorMemory: TutorMemory;
  tutorMessages: TutorMessagePage;
  tutorOperations: TutorOperations;
  tutorPolicy: TutorPolicy;
  tutorReceipt: TutorConversation;
  tutorReply: TutorMessage;
  tutorReplyHistory: TutorReplyHistory;
  tutorReport: TutorReport;
  tutorReports: TutorReportPage;
  tutorResource: TutorResource;
  tutorResources: TutorResourcePage;
  tutorStaffMembers: Array<TutorStaffMember>;
  tutorUsage: TutorUsage;
};

export type QueryActiveExamAttemptArgs = {
  examId: Scalars["ID"]["input"];
  mode: ExamAttemptMode;
};

export type QueryAdminContentArgs = {
  kind: ContentKind;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<ContentStatus>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryAdminExamsArgs = {
  examType?: InputMaybe<ExamType>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<ExamStatus>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryAssessmentAttemptArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryAssessmentHistoryArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  skill?: InputMaybe<AssessmentSkill>;
  status?: InputMaybe<AssessmentAttemptStatus>;
  taskId?: InputMaybe<Scalars["ID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryAssessmentNotificationsArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryAssessmentReviewsArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryAssessmentSubmissionArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryAssessmentSubmissionsArgs = {
  oldest?: InputMaybe<Scalars["Boolean"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  skill?: InputMaybe<AssessmentSkill>;
  status?: InputMaybe<AssessmentAttemptStatus>;
  term?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryAssessmentTaskArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryAssessmentTasksArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  skill?: InputMaybe<AssessmentSkill>;
};

export type QueryAttemptPaperArgs = {
  attemptId: Scalars["ID"]["input"];
};

export type QueryAuthoringAssessmentTaskArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryAuthoringAssessmentTasksArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  skill?: InputMaybe<AssessmentSkill>;
  status?: InputMaybe<AssessmentTaskStatus>;
};

export type QueryDictationLessonArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryDictationLessonsArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  topic?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryDictationStatsArgs = {
  periodDays?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryExamArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryExamAttemptArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryExamAttemptsArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryExamDraftArgs = {
  attemptId: Scalars["ID"]["input"];
};

export type QueryExamOutlineArgs = {
  examId: Scalars["ID"]["input"];
};

export type QueryExamsArgs = {
  certificateType?: InputMaybe<CertificateType>;
  certificateVariant?: InputMaybe<CertificateVariant>;
  examType?: InputMaybe<ExamType>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<ExamSortBy>;
  targetLevel?: InputMaybe<TargetLevel>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryFlashcardSetArgs = {
  id: Scalars["ID"]["input"];
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryFlashcardSetSummaryArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryFlashcardSetsArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  sortBy?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  topic?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryFlashcardStatsArgs = {
  periodDays?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryFlashcardStudyQueueArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  setId: Scalars["ID"]["input"];
};

export type QueryLevelCheckArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryQuizAttemptArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryQuizPaperArgs = {
  attemptId: Scalars["ID"]["input"];
};

export type QueryQuizzesArgs = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySpeakingAttemptArgs = {
  id: Scalars["ID"]["input"];
};

export type QuerySpeakingAttemptsArgs = {
  promptId: Scalars["ID"]["input"];
};

export type QuerySpeakingPromptArgs = {
  id: Scalars["ID"]["input"];
};

export type QuerySpeakingPromptsArgs = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryTutorConversationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTutorHistoryArgs = {
  archived?: InputMaybe<Scalars["Boolean"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryTutorMemoryArgs = {
  conversationId: Scalars["ID"]["input"];
};

export type QueryTutorMessagesArgs = {
  id: Scalars["ID"]["input"];
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryTutorReceiptArgs = {
  clientMessageId: Scalars["ID"]["input"];
};

export type QueryTutorReplyArgs = {
  conversationId: Scalars["ID"]["input"];
  messageId: Scalars["ID"]["input"];
};

export type QueryTutorReplyHistoryArgs = {
  conversationId: Scalars["ID"]["input"];
  messageId: Scalars["ID"]["input"];
};

export type QueryTutorReportArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTutorReportsArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryTutorResourceArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTutorResourcesArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * An option as the learner sees it while sitting: no correctness flag and no
 * explanation. Both arrive afterwards on AttemptOptionReview.
 */
export type QuestionOption = {
  __typename?: "QuestionOption";
  content: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  orderNo: Scalars["Int"]["output"];
};

export type Quiz = {
  __typename?: "Quiz";
  attemptCount: Scalars["Int"]["output"];
  /** Per learner. Null until they have finished one. */
  bestScorePercent?: Maybe<Scalars["Float"]["output"]>;
  category: Scalars["String"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  /** Percentage, so a quiz can gain a question without its pass mark shifting. */
  passingScorePercent: Scalars["Int"]["output"];
  questionCount: Scalars["Int"]["output"];
  slug: Scalars["String"]["output"];
  targetLevel?: Maybe<Scalars["String"]["output"]>;
  timeLimitSeconds: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
};

export type QuizAnswerInput = {
  questionId: Scalars["ID"]["input"];
  /**
   * What an answer means depends on the type: an option id, a typed phrase, the
   * chosen words joined by spaces, or the matched halves joined by "|".
   */
  response: Scalars["String"]["input"];
};

export type QuizAttempt = {
  __typename?: "QuizAttempt";
  correctAnswerCount?: Maybe<Scalars["Int"]["output"]>;
  expiresAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  maxScore: Scalars["Float"]["output"];
  passed?: Maybe<Scalars["Boolean"]["output"]>;
  questionCount: Scalars["Int"]["output"];
  quizId: Scalars["ID"]["output"];
  quizTitle: Scalars["String"]["output"];
  /** True when the backend handed back an attempt that was already open. */
  resumed: Scalars["Boolean"]["output"];
  /** Empty while the attempt is IN_PROGRESS - it carries the answer key. */
  reviews: Array<QuizQuestionReview>;
  /** Null until the attempt is scored. */
  score?: Maybe<Scalars["Float"]["output"]>;
  scorePercentage?: Maybe<Scalars["Float"]["output"]>;
  startedAt: Scalars["DateTime"]["output"];
  status: QuizAttemptStatus;
  submittedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export enum QuizAttemptStatus {
  EXPIRED = "EXPIRED",
  IN_PROGRESS = "IN_PROGRESS",
  SCORED = "SCORED",
}

/**
 * An option as the learner sees it while sitting. There is no correctness flag
 * on this type at all - the answer key is a different shape entirely, so there
 * is no field here to forget to clear.
 */
export type QuizOption = {
  __typename?: "QuizOption";
  content: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  label: Scalars["String"]["output"];
  orderNo: Scalars["Int"]["output"];
};

export type QuizPage = {
  __typename?: "QuizPage";
  items: Array<Quiz>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type QuizPaper = {
  __typename?: "QuizPaper";
  attemptId: Scalars["ID"]["output"];
  description: Scalars["String"]["output"];
  expiresAt: Scalars["DateTime"]["output"];
  questions: Array<QuizPaperQuestion>;
  quizId: Scalars["ID"]["output"];
  timeLimitSeconds: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
};

export type QuizPaperQuestion = {
  __typename?: "QuizPaperQuestion";
  afterText?: Maybe<Scalars["String"]["output"]>;
  /** FILL_BLANK renders as "<before> ___ <after>"; null on every other type. */
  beforeText?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  leftTexts: Array<Scalars["String"]["output"]>;
  options: Array<QuizOption>;
  orderNo: Scalars["Int"]["output"];
  originalSentence?: Maybe<Scalars["String"]["output"]>;
  points: Scalars["Int"]["output"];
  prompt: Scalars["String"]["output"];
  questionType: QuizQuestionType;
  rewriteKeyword?: Maybe<Scalars["String"]["output"]>;
  /**
   * Shuffled by the backend, seeded from the attempt: the stored order is the
   * answer, and reloading must not deal a new puzzle.
   */
  rightTexts: Array<Scalars["String"]["output"]>;
  scrambledWords: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  wordBank: Array<Scalars["String"]["output"]>;
};

export type QuizQuestionReview = {
  __typename?: "QuizQuestionReview";
  correct: Scalars["Boolean"]["output"];
  correctAnswerText: Scalars["String"]["output"];
  explanation: Scalars["String"]["output"];
  pointsEarned: Scalars["Float"]["output"];
  pointsPossible: Scalars["Int"]["output"];
  prompt: Scalars["String"]["output"];
  questionId: Scalars["ID"]["output"];
  questionType: QuizQuestionType;
  userAnswerText: Scalars["String"]["output"];
};

export enum QuizQuestionType {
  FILL_BLANK = "FILL_BLANK",
  MATCHING = "MATCHING",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  REORDER = "REORDER",
  REWRITE = "REWRITE",
}

/**
 * What the learner said about a card. SM-2 grades answers 0-5; these are the
 * four buttons the interface offers, and the backend maps them onto the
 * algorithm. Only AGAIN counts as a failure.
 */
export enum ReviewRating {
  AGAIN = "AGAIN",
  EASY = "EASY",
  GOOD = "GOOD",
  HARD = "HARD",
}

export type Roadmap = {
  __typename?: "Roadmap";
  /** An adjustment is being worked out; the stages shown stay in force meanwhile. */
  adjusting: Scalars["Boolean"]["output"];
  adjustments: Array<RoadmapAdjustment>;
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  dailyMinutes?: Maybe<Scalars["Int"]["output"]>;
  failureCode?: Maybe<Scalars["String"]["output"]>;
  goalType: RoadmapGoalType;
  id: Scalars["ID"]["output"];
  pendingReason?: Maybe<AdjustmentReason>;
  schedule: RoadmapSchedule;
  stages: Array<RoadmapStage>;
  startLevel: CefrLevel;
  startScore?: Maybe<Scalars["Float"]["output"]>;
  status: RoadmapStatus;
  targetCertificate?: Maybe<Scalars["String"]["output"]>;
  targetDate?: Maybe<Scalars["Date"]["output"]>;
  targetLevel?: Maybe<CefrLevel>;
  targetScore?: Maybe<Scalars["Float"]["output"]>;
};

export type RoadmapAdjustment = {
  __typename?: "RoadmapAdjustment";
  createdAt: Scalars["DateTime"]["output"];
  reason: AdjustmentReason;
};

export enum RoadmapContentKind {
  ASSESSMENT_TASK = "ASSESSMENT_TASK",
  DICTATION_LESSON = "DICTATION_LESSON",
  FLASHCARD_SET = "FLASHCARD_SET",
  QUIZ = "QUIZ",
  SPEAKING_PROMPT = "SPEAKING_PROMPT",
}

export enum RoadmapGoalType {
  CERTIFICATE = "CERTIFICATE",
  LEVEL = "LEVEL",
}

export type RoadmapItem = {
  __typename?: "RoadmapItem";
  /**
   * The set, lesson, quiz, prompt or task to open; the link is built from this
   * and the kind (and skill, for a writing or speaking task).
   */
  contentId: Scalars["ID"]["output"];
  done: Scalars["Boolean"]["output"];
  estimatedMinutes: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  kind: RoadmapContentKind;
  /** Derived from the learner's activity on every read. */
  percentDone: Scalars["Int"]["output"];
  plannedWeek: Scalars["Int"]["output"];
  required: Scalars["Boolean"]["output"];
  skill?: Maybe<Scalars["String"]["output"]>;
  targetPercent: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
};

export type RoadmapMilestone = {
  __typename?: "RoadmapMilestone";
  achievedAt?: Maybe<Scalars["DateTime"]["output"]>;
  attemptCount: Scalars["Int"]["output"];
  examId?: Maybe<Scalars["ID"]["output"]>;
  id: Scalars["ID"]["output"];
  kind: MilestoneKind;
  /** Every required item of the stage is done. */
  ready: Scalars["Boolean"]["output"];
  requiredLevel?: Maybe<CefrLevel>;
  requiredScore?: Maybe<Scalars["Float"]["output"]>;
  resultLevel?: Maybe<CefrLevel>;
  resultScore?: Maybe<Scalars["Float"]["output"]>;
  status: MilestoneStatus;
};

export enum RoadmapSchedule {
  /** The current stage ran past its planned end. */
  BEHIND = "BEHIND",
  ON_TRACK = "ON_TRACK",
}

export type RoadmapStage = {
  __typename?: "RoadmapStage";
  focusSkills: Array<Scalars["String"]["output"]>;
  fromLevel: CefrLevel;
  id: Scalars["ID"]["output"];
  items: Array<RoadmapItem>;
  milestone?: Maybe<RoadmapMilestone>;
  orderNo: Scalars["Int"]["output"];
  /** Mean progress across the stage's required items. */
  percentDone: Scalars["Int"]["output"];
  plannedEnd: Scalars["Date"]["output"];
  plannedStart: Scalars["Date"]["output"];
  status: RoadmapStageStatus;
  summary: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  toLevel: CefrLevel;
};

export enum RoadmapStageStatus {
  CURRENT = "CURRENT",
  LOCKED = "LOCKED",
  PASSED = "PASSED",
  /** Taken out by an adjustment. Never returned in a roadmap's stages. */
  REPLACED = "REPLACED",
}

export enum RoadmapStatus {
  /** The learner turned the roadmap off. */
  ABANDONED = "ABANDONED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  /** The first plan could not be made; createRoadmap asks again. */
  FAILED = "FAILED",
  /** Waiting for the first plan from the AI. */
  GENERATING = "GENERATING",
  /** Replaced by a plan for a different goal. */
  SUPERSEDED = "SUPERSEDED",
}

/**
 * What the account may do. For drawing the interface only - every gate is
 * enforced on the backend from the verified token, never from this field.
 */
export enum Role {
  ADMIN = "ADMIN",
  LEARNER = "LEARNER",
  STAFF = "STAFF",
}

/**
 * One recording and its score.
 *
 * Every score is nullable and stays that way. The provider omits what it did
 * not measure - prosody unless asked for, accuracy on a recording of silence -
 * so a missing measurement is shown as missing. A zero would tell a learner
 * they scored nothing when nothing was measured.
 */
export type SpeakingAttempt = {
  __typename?: "SpeakingAttempt";
  accuracyPercent?: Maybe<Scalars["Float"]["output"]>;
  assessedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Pre-signed and short-lived. */
  audioUrl: Scalars["String"]["output"];
  completenessPercent?: Maybe<Scalars["Float"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  /** Why no score will arrive, when none will. */
  errorCode?: Maybe<Scalars["String"]["output"]>;
  fluencyPercent?: Maybe<Scalars["Float"]["output"]>;
  id: Scalars["ID"]["output"];
  promptTitle: Scalars["String"]["output"];
  pronunciationPercent?: Maybe<Scalars["Float"]["output"]>;
  prosodyPercent?: Maybe<Scalars["Float"]["output"]>;
  /** What the provider heard. Null until assessed. */
  recognizedText?: Maybe<Scalars["String"]["output"]>;
  referenceText: Scalars["String"]["output"];
  speakingPromptId: Scalars["ID"]["output"];
  status: SpeakingAttemptStatus;
  /** Empty while the assessment is still queued. */
  words: Array<SpeakingWord>;
};

/**
 * Where one recording stands. There is no RUNNING: whether a worker currently
 * has the job in hand is the queue's business, and QUEUED is all a learner
 * watching a spinner needs to know.
 */
export enum SpeakingAttemptStatus {
  ASSESSED = "ASSESSED",
  AWAITING_UPLOAD = "AWAITING_UPLOAD",
  FAILED = "FAILED",
  QUEUED = "QUEUED",
}

export type SpeakingPhonemeScore = {
  __typename?: "SpeakingPhonemeScore";
  accuracy?: Maybe<Scalars["Float"]["output"]>;
  phoneme: Scalars["String"]["output"];
};

export type SpeakingPrompt = {
  __typename?: "SpeakingPrompt";
  /** Per learner. Null until they have finished one. */
  bestScorePercent?: Maybe<Scalars["Float"]["output"]>;
  category: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  ipaTranscript?: Maybe<Scalars["String"]["output"]>;
  /** The sound being drilled, e.g. "/iː/ vs /ɪ/". */
  phonemeTarget?: Maybe<Scalars["String"]["output"]>;
  /** What the learner is asked to say. The accuracy score is accuracy against this. */
  referenceText: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
  targetLevel?: Maybe<Scalars["String"]["output"]>;
  tips: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  translationVi?: Maybe<Scalars["String"]["output"]>;
};

export type SpeakingPromptPage = {
  __typename?: "SpeakingPromptPage";
  items: Array<SpeakingPrompt>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

/** Where to put a recording, and for how long that offer stands. */
export type SpeakingUploadTicket = {
  __typename?: "SpeakingUploadTicket";
  attemptId: Scalars["ID"]["output"];
  contentType: Scalars["String"]["output"];
  /** Told to the client so it can say "start again" rather than failing on an expired URL. */
  expiresInSeconds: Scalars["Int"]["output"];
  /**
   * A presigned PUT straight to object storage. The browser uploads there, not
   * through this BFF: a minute of audio through a request thread costs a thread
   * for a minute and lands in the same bucket either way.
   */
  uploadUrl: Scalars["String"]["output"];
};

export type SpeakingWord = {
  __typename?: "SpeakingWord";
  accuracyPercent?: Maybe<Scalars["Float"]["output"]>;
  durationMs?: Maybe<Scalars["Int"]["output"]>;
  /** The provider's own label: Mispronunciation, Omission, Insertion, None. */
  errorType?: Maybe<Scalars["String"]["output"]>;
  offsetMs?: Maybe<Scalars["Int"]["output"]>;
  orderNo: Scalars["Int"]["output"];
  phonemes: Array<SpeakingPhonemeScore>;
  word: Scalars["String"]["output"];
};

export type StartExamAttemptInput = {
  mode?: InputMaybe<ExamAttemptMode>;
  /**
   * Without it, an open attempt that is not the one asked for fails with
   * extensions.backendCode: ATTEMPT_IN_PROGRESS so the learner can choose.
   */
  onOpen?: InputMaybe<OpenAttemptChoice>;
  /** Parts a practice covers. Ignored for FULL. */
  partIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** A practice's clock, 1-300 minutes; null for none. Ignored for FULL. */
  timeLimitMinutes?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SubmitAnswerInput = {
  questionId: Scalars["ID"]["input"];
  /** Empty for a question the learner skipped; several for a multi-select. */
  selectedOptionIds: Array<Scalars["ID"]["input"]>;
};

/**
 * The certificate a learner aims at. Deliberately not the exam module's
 * CertificateType: that one describes a paper, this one describes a learner's
 * goal, and the backend keeps user.entity.CertificateType apart from
 * exam.entity.CertificateType for the same reason.
 */
export enum TargetCertificate {
  IELTS = "IELTS",
  TOEIC = "TOEIC",
}

/**
 * CEFR band a paper is aimed at. Separate from CefrLevel, which is a learner's
 * own level - the backend keeps the two enums apart for the same reason.
 */
export enum TargetLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export type TutorConversation = {
  __typename?: "TutorConversation";
  conversation: TutorConversationSummary;
  messages: Array<TutorMessage>;
};

export type TutorConversationSummary = {
  __typename?: "TutorConversationSummary";
  archivedAt?: Maybe<Scalars["DateTime"]["output"]>;
  assessmentAttemptId?: Maybe<Scalars["ID"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  examAttemptId?: Maybe<Scalars["ID"]["output"]>;
  examQuestionId?: Maybe<Scalars["ID"]["output"]>;
  id: Scalars["ID"]["output"];
  lastMessageAt: Scalars["DateTime"]["output"];
  messageCount: Scalars["Int"]["output"];
  quizAttemptId?: Maybe<Scalars["ID"]["output"]>;
  quizQuestionId?: Maybe<Scalars["ID"]["output"]>;
  /** Taken from the first thing the learner said, so the list reads as what they asked. */
  title: Scalars["String"]["output"];
  topic?: Maybe<Scalars["String"]["output"]>;
  useLearningContext: Scalars["Boolean"]["output"];
};

export type TutorFailureCount = {
  __typename?: "TutorFailureCount";
  code: Scalars["String"]["output"];
  count: Scalars["Int"]["output"];
};

export type TutorHistoryPage = {
  __typename?: "TutorHistoryPage";
  items: Array<TutorConversationSummary>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type TutorMemory = {
  __typename?: "TutorMemory";
  batchSize: Scalars["Int"]["output"];
  content?: Maybe<Scalars["String"]["output"]>;
  enabled: Scalars["Boolean"]["output"];
  pendingMessageId?: Maybe<Scalars["ID"]["output"]>;
  remainingMessages: Scalars["Int"]["output"];
  throughOrder: Scalars["Int"]["output"];
};

export type TutorMessage = {
  __typename?: "TutorMessage";
  answeredAt?: Maybe<Scalars["DateTime"]["output"]>;
  /**
   * Null while a reply is pending. Nullable on purpose: a screen has to tell
   * "still thinking" from "answered with nothing", and an empty string for both
   * would make that impossible.
   */
  content?: Maybe<Scalars["String"]["output"]>;
  correction?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  /** Why no answer came, when none did. */
  errorCode?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  model?: Maybe<Scalars["String"]["output"]>;
  orderNo: Scalars["Int"]["output"];
  reportStatus?: Maybe<Scalars["String"]["output"]>;
  reported: Scalars["Boolean"]["output"];
  restartCount: Scalars["Int"]["output"];
  revision: Scalars["Int"]["output"];
  role: TutorMessageRole;
  sources: Array<TutorSource>;
  status: TutorMessageStatus;
  summary?: Maybe<Scalars["Boolean"]["output"]>;
};

export type TutorMessagePage = {
  __typename?: "TutorMessagePage";
  conversation: TutorConversationSummary;
  messages: Array<TutorMessage>;
  page: Scalars["Int"]["output"];
  totalElements: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export enum TutorMessageRole {
  ASSISTANT = "ASSISTANT",
  USER = "USER",
}

/**
 * Whether a turn has something to show yet. Only the tutor's side is ever
 * PENDING; the learner's own message is READY the moment it arrives.
 */
export enum TutorMessageStatus {
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  PENDING = "PENDING",
  READY = "READY",
}

export type TutorOperations = {
  __typename?: "TutorOperations";
  completedToday: Scalars["Int"]["output"];
  failedToday: Scalars["Int"]["output"];
  metrics?: Maybe<TutorQueueMetrics>;
  oldestPendingAt?: Maybe<Scalars["DateTime"]["output"]>;
  pending: Scalars["Int"]["output"];
  running: Scalars["Int"]["output"];
  scope: Scalars["String"]["output"];
};

export type TutorPolicy = {
  __typename?: "TutorPolicy";
  accepting: Scalars["Boolean"]["output"];
  allowedModes: Array<Scalars["String"]["output"]>;
  dailyLimit: Scalars["Int"]["output"];
  environmentEnabled: Scalars["Boolean"]["output"];
  model: Scalars["String"]["output"];
  streamingEnabled: Scalars["Boolean"]["output"];
  version: Scalars["Int"]["output"];
  voiceEnabled: Scalars["Boolean"]["output"];
};

export type TutorPolicyInput = {
  accepting: Scalars["Boolean"]["input"];
  allowedModes: Array<Scalars["String"]["input"]>;
  reason: Scalars["String"]["input"];
  version: Scalars["Int"]["input"];
};

export type TutorQueueMetrics = {
  __typename?: "TutorQueueMetrics";
  completionP95Ms?: Maybe<Scalars["Float"]["output"]>;
  failures: Array<TutorFailureCount>;
  knownInputTokens: Scalars["Float"]["output"];
  knownOutputTokens: Scalars["Float"]["output"];
  queueP95Ms?: Maybe<Scalars["Float"]["output"]>;
  samples: Scalars["Int"]["output"];
  unknownUsageJobs: Scalars["Int"]["output"];
};

export type TutorReplyHistory = {
  __typename?: "TutorReplyHistory";
  canSelect: Scalars["Boolean"]["output"];
  currentRevision: Scalars["Int"]["output"];
  items: Array<TutorReplyVersion>;
};

export type TutorReplyVersion = {
  __typename?: "TutorReplyVersion";
  content?: Maybe<Scalars["String"]["output"]>;
  correction?: Maybe<Scalars["String"]["output"]>;
  model?: Maybe<Scalars["String"]["output"]>;
  revision: Scalars["Int"]["output"];
  status: Scalars["String"]["output"];
};

export type TutorReport = {
  __typename?: "TutorReport";
  answer?: Maybe<Scalars["String"]["output"]>;
  assignedTo?: Maybe<Scalars["ID"]["output"]>;
  correction?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  learnerNote?: Maybe<Scalars["String"]["output"]>;
  messageId: Scalars["ID"]["output"];
  question?: Maybe<Scalars["String"]["output"]>;
  resolvedAt?: Maybe<Scalars["DateTime"]["output"]>;
  reviewerNote?: Maybe<Scalars["String"]["output"]>;
  revision: Scalars["Int"]["output"];
  status: Scalars["String"]["output"];
};

export type TutorReportPage = {
  __typename?: "TutorReportPage";
  items: Array<TutorReport>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type TutorResource = {
  __typename?: "TutorResource";
  authorId: Scalars["ID"]["output"];
  body: Scalars["String"]["output"];
  documentId: Scalars["ID"]["output"];
  id: Scalars["ID"]["output"];
  reviewNote?: Maybe<Scalars["String"]["output"]>;
  rowVersion: Scalars["Int"]["output"];
  status: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  versionNumber: Scalars["Int"]["output"];
};

export type TutorResourceInput = {
  body: Scalars["String"]["input"];
  rowVersion?: InputMaybe<Scalars["Int"]["input"]>;
  title: Scalars["String"]["input"];
};

export type TutorResourcePage = {
  __typename?: "TutorResourcePage";
  items: Array<TutorResource>;
  page: Scalars["Int"]["output"];
  size: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type TutorReviewInput = {
  action: Scalars["String"]["input"];
  assignedTo?: InputMaybe<Scalars["ID"]["input"]>;
  correction?: InputMaybe<Scalars["String"]["input"]>;
  note?: InputMaybe<Scalars["String"]["input"]>;
};

export type TutorSource = {
  __typename?: "TutorSource";
  excerpt: Scalars["String"]["output"];
  label: Scalars["String"]["output"];
  resourceId: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  versionNumber: Scalars["Int"]["output"];
};

export type TutorStaffMember = {
  __typename?: "TutorStaffMember";
  displayName: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
};

export type TutorUsage = {
  __typename?: "TutorUsage";
  allowedModes: Array<Scalars["String"]["output"]>;
  enabled: Scalars["Boolean"]["output"];
  limit: Scalars["Int"]["output"];
  maxMessageLength: Scalars["Int"]["output"];
  memorySupported: Scalars["Boolean"]["output"];
  remaining: Scalars["Int"]["output"];
  resetsAt: Scalars["DateTime"]["output"];
  streaming: Scalars["Boolean"]["output"];
  supportedContexts: Array<Scalars["String"]["output"]>;
  used: Scalars["Int"]["output"];
  voice: Scalars["Boolean"]["output"];
};

export type UpdateProfileInput = {
  birthDate?: InputMaybe<Scalars["Date"]["input"]>;
  displayName: Scalars["String"]["input"];
  fullName: Scalars["String"]["input"];
  gender?: InputMaybe<Gender>;
};

export type UserTourStatus = {
  __typename?: "UserTourStatus";
  completed: Scalars["Boolean"]["output"];
};
