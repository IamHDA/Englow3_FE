export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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

export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export enum CertificateType {
  IELTS = 'IELTS',
  TOEIC = 'TOEIC'
}

export enum CertificateVariant {
  ACADEMIC = 'ACADEMIC',
  GENERAL = 'GENERAL',
  LR = 'LR',
  SW = 'SW'
}

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
  status: ExamStatus;
  targetLevel?: Maybe<TargetLevel>;
  title: Scalars['String']['output'];
  versionNumber: Scalars['Int']['output'];
};

export type ExamAttempt = {
  __typename?: 'ExamAttempt';
  correctAnswerCount?: Maybe<Scalars['Int']['output']>;
  examId: Scalars['ID']['output'];
  /**
   * The deadline the backend issued. This is the only authority on remaining
   * time - a countdown from durationSeconds drifts across a sleeping laptop.
   */
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  maxRawScore?: Maybe<Scalars['Float']['output']>;
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

export enum ExamAttemptStatus {
  EXPIRED = 'EXPIRED',
  IN_PROGRESS = 'IN_PROGRESS',
  SCORED = 'SCORED'
}

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
  status: ExamStatus;
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

export enum ExamStatus {
  ARCHIVED = 'ARCHIVED',
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export enum ExamType {
  MOCK = 'MOCK',
  PLACEMENT = 'PLACEMENT'
}

export enum Gender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  OTHER = 'OTHER'
}

export type LearnerExamItem = {
  __typename?: 'LearnerExamItem';
  attemptStatus?: Maybe<Scalars['String']['output']>;
  bestScore?: Maybe<Scalars['Float']['output']>;
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

export enum LearningSkill {
  GRAMMAR = 'GRAMMAR',
  LISTENING = 'LISTENING',
  PRONUNCIATION = 'PRONUNCIATION',
  READING = 'READING',
  SPEAKING = 'SPEAKING',
  VOCABULARY = 'VOCABULARY',
  WRITING = 'WRITING'
}

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
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['Boolean']['output']>;
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
   * Submits and scores in one step. The backend rejects a submission after
   * expiresAt, which is why the client must never decide expiry itself.
   */
  submitExamAttempt: ExamAttempt;
  updateProfile: Me;
};


export type MutationArchiveExamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPublishExamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSelectLearningPurposesArgs = {
  purposeIds: Array<Scalars['Int']['input']>;
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
  examId: Scalars['ID']['input'];
};


export type MutationSubmitExamAttemptArgs = {
  answers: Array<SubmitAnswerInput>;
  attemptId: Scalars['ID']['input'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type OnboardingState = {
  __typename?: 'OnboardingState';
  certificateLearner?: Maybe<Scalars['Boolean']['output']>;
  currentLevel?: Maybe<CefrLevel>;
  learningPurposeIds: Array<Scalars['Int']['output']>;
  targetCertificateType?: Maybe<Scalars['String']['output']>;
  targetDate?: Maybe<Scalars['Date']['output']>;
  targetScore?: Maybe<Scalars['Float']['output']>;
  targetSkills: Array<LearningSkill>;
};

export enum OnboardingStep {
  CERTIFICATE_TARGET = 'CERTIFICATE_TARGET',
  COMPLETED = 'COMPLETED',
  CURRENT_LEVEL = 'CURRENT_LEVEL',
  LEARNING_GOAL = 'LEARNING_GOAL',
  LEARNING_PURPOSES = 'LEARNING_PURPOSES',
  TARGET_SKILLS = 'TARGET_SKILLS'
}

export type Query = {
  __typename?: 'Query';
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
  /** Learner exam detail by id */
  exam?: Maybe<LearnerExamItem>;
  /**
   * The scored attempt. Carries the answer key, so it is only worth reading
   * once the attempt has left IN_PROGRESS.
   */
  examAttempt: ExamAttempt;
  /** Learner exam catalogue search - returns published exams. */
  exams: LearnerExamPage;
  health: Scalars['String']['output'];
  learningPurposes: Array<LearningPurpose>;
  me: Me;
};


export type QueryAdminExamsArgs = {
  examType?: InputMaybe<ExamType>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ExamStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAttemptPaperArgs = {
  attemptId: Scalars['ID']['input'];
};


export type QueryExamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExamAttemptArgs = {
  id: Scalars['ID']['input'];
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
export enum TargetCertificate {
  IELTS = 'IELTS',
  TOEIC = 'TOEIC'
}

/**
 * CEFR band a paper is aimed at. Separate from CefrLevel, which is a learner's
 * own level - the backend keeps the two enums apart for the same reason.
 */
export enum TargetLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export type UpdateProfileInput = {
  birthDate?: InputMaybe<Scalars['Date']['input']>;
  displayName: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  gender?: InputMaybe<Gender>;
};
