export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: unknown; output: unknown };
  DateTime: { input: unknown; output: unknown };
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

export enum ExamStatus {
  ARCHIVED = "ARCHIVED",
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export enum ExamType {
  MOCK = "MOCK",
  PLACEMENT = "PLACEMENT",
}

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
   * DRAFT -> PUBLISHED. The backend refuses a paper that is not a draft, has
   * no section or question, whose section scores do not total maxRawScore, or
   * that has an ungradeable question - the reason arrives as
   * extensions.backendCode on the error (e.g. EXAM_SCORE_MISMATCH).
   */
  publishExam: Exam;
};

export type MutationArchiveExamArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationPublishExamArgs = {
  id: Scalars["ID"]["input"];
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
  /** Learner exam catalogue search - returns published exams. */
  exams: LearnerExamPage;
  health: Scalars["String"]["output"];
  learningPurposes: Array<LearningPurpose>;
  me: Me;
};

export type QueryAdminExamsArgs = {
  examType?: InputMaybe<ExamType>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  size?: InputMaybe<Scalars["Int"]["input"]>;
  status?: InputMaybe<ExamStatus>;
  title?: InputMaybe<Scalars["String"]["input"]>;
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
