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

export type AttemptOptionReview = {
  __typename?: "AttemptOptionReview";
  correct: Scalars["Boolean"]["output"];
  explanation?: Maybe<Scalars["String"]["output"]>;
  optionId: Scalars["ID"]["output"];
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

export type DictationLesson = {
  __typename?: "DictationLesson";
  /** Per learner: sentences whose best attempt cleared the completion threshold. */
  completedSentenceCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  lastPractisedAt?: Maybe<Scalars["DateTime"]["output"]>;
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

/**
 * A sentence as the learner practises it. There is no transcript on this type
 * at all - the answer is a different shape entirely, produced only once they
 * have committed one of their own.
 */
export type DictationSentence = {
  __typename?: "DictationSentence";
  audioDurationSeconds: Scalars["Int"]["output"];
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
};

/** The only type that carries the transcript. */
export type DictationSubmission = {
  __typename?: "DictationSubmission";
  accuracyPercent: Scalars["Float"]["output"];
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
  status: ExamStatus;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars["String"]["output"];
  versionNumber: Scalars["Int"]["output"];
};

export type ExamAttempt = {
  __typename?: "ExamAttempt";
  correctAnswerCount?: Maybe<Scalars["Int"]["output"]>;
  examId: Scalars["ID"]["output"];
  /**
   * The deadline the backend issued. This is the only authority on remaining
   * time - a countdown from durationSeconds drifts across a sleeping laptop.
   */
  expiresAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  maxRawScore?: Maybe<Scalars["Float"]["output"]>;
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
};

export enum ExamAttemptStatus {
  EXPIRED = "EXPIRED",
  IN_PROGRESS = "IN_PROGRESS",
  SCORED = "SCORED",
}

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
  status: ExamStatus;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars["String"]["output"];
  versionNumber: Scalars["Int"]["output"];
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

export enum ExamStatus {
  ARCHIVED = "ARCHIVED",
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export enum ExamType {
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
  set: FlashcardSet;
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

export type LearnerExamItem = {
  __typename?: "LearnerExamItem";
  attemptStatus?: Maybe<Scalars["String"]["output"]>;
  bestScore?: Maybe<Scalars["Float"]["output"]>;
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
  targetDate?: InputMaybe<Scalars["Date"]["input"]>;
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
};

export type Mutation = {
  __typename?: "Mutation";
  _empty?: Maybe<Scalars["Boolean"]["output"]>;
  /**
   * DRAFT or PUBLISHED -> ARCHIVED. There is no delete; archiving is the
   * retirement path. Archiving an already-archived paper fails with
   * extensions.backendCode: EXAM_ALREADY_ARCHIVED.
   */
  archiveExam: Exam;
  /**
   * Final step. Refuses with ONBOARDING_PURPOSE_REQUIRED,
   * ONBOARDING_LEVEL_REQUIRED or ONBOARDING_CERTIFICATE_TARGET_REQUIRED when an
   * earlier step is missing.
   */
  completeOnboarding: OnboardingState;
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
  /**
   * Records the purposes and advances the step. Which step comes next is the
   * backend's decision: a learner who picked the certificate purpose goes to
   * CERTIFICATE_TARGET, everyone else skips straight to CURRENT_LEVEL. Read the
   * new step from Me.onboardingStep rather than assuming either branch.
   */
  selectLearningPurposes: OnboardingState;
  /**
   * An empty list means "I don't know yet" and is allowed. This does not
   * advance the step - the backend leaves the learner on TARGET_SKILLS until
   * completeOnboarding is called.
   */
  selectTargetSkills: OnboardingState;
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
   * Submits and scores in one step. A question left out is marked wrong rather
   * than skipped, so the percentage means what it says.
   */
  submitQuizAttempt: QuizAttempt;
  updateProfile: Me;
};

export type MutationArchiveExamArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationPublishExamArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRateFlashcardArgs = {
  flashcardId: Scalars["ID"]["input"];
  rating: ReviewRating;
  timeSpentSeconds: Scalars["Int"]["input"];
};

export type MutationSelectLearningPurposesArgs = {
  purposeIds: Array<Scalars["Int"]["input"]>;
};

export type MutationSelectTargetSkillsArgs = {
  skills: Array<LearningSkill>;
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

export type MutationStartExamAttemptArgs = {
  examId: Scalars["ID"]["input"];
};

export type MutationStartQuizAttemptArgs = {
  quizId: Scalars["ID"]["input"];
};

export type MutationSubmitDictationArgs = {
  response: Scalars["String"]["input"];
  sentenceId: Scalars["ID"]["input"];
};

export type MutationSubmitExamAttemptArgs = {
  answers: Array<SubmitAnswerInput>;
  attemptId: Scalars["ID"]["input"];
};

export type MutationSubmitQuizAttemptArgs = {
  answers: Array<QuizAnswerInput>;
  attemptId: Scalars["ID"]["input"];
};

export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type OnboardingState = {
  __typename?: "OnboardingState";
  certificateLearner?: Maybe<Scalars["Boolean"]["output"]>;
  currentLevel?: Maybe<CefrLevel>;
  learningPurposeIds: Array<Scalars["Int"]["output"]>;
  targetCertificateType?: Maybe<Scalars["String"]["output"]>;
  targetDate?: Maybe<Scalars["Date"]["output"]>;
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

export type Query = {
  __typename?: "Query";
  /**
   * Admin catalogue search - returns drafts and archived papers too, so the
   * backend restricts it to ADMIN. Sorted newest first by the backend.
   */
  adminExams: ExamPage;
  /**
   * The paper to sit, reachable only through an open attempt. There is no
   * lookup by exam id: the answer key is stripped per attempt, and handing out
   * a paper without one would mean handing it out unscoped.
   */
  attemptPaper: ExamPaper;
  dictationLesson: DictationLessonDetail;
  dictationLessons: DictationLessonPage;
  /** Learner exam detail by id */
  exam?: Maybe<LearnerExamItem>;
  /**
   * The scored attempt. Carries the answer key, so it is only worth reading
   * once the attempt has left IN_PROGRESS.
   */
  examAttempt: ExamAttempt;
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
  health: Scalars["String"]["output"];
  learningPurposes: Array<LearningPurpose>;
  me: Me;
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
};

export type QueryAdminExamsArgs = {
  examType?: InputMaybe<ExamType>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<ExamStatus>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryAttemptPaperArgs = {
  attemptId: Scalars["ID"]["input"];
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

export type QueryExamArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryExamAttemptArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryExamsArgs = {
  certificateType?: InputMaybe<CertificateType>;
  certificateVariant?: InputMaybe<CertificateVariant>;
  examType?: InputMaybe<ExamType>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  targetLevel?: InputMaybe<TargetLevel>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryFlashcardSetArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryFlashcardSetsArgs = {
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
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

export type UpdateProfileInput = {
  birthDate?: InputMaybe<Scalars["Date"]["input"]>;
  displayName: Scalars["String"]["input"];
  fullName: Scalars["String"]["input"];
  gender?: InputMaybe<Gender>;
};
