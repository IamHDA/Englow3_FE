export const examTypeDefs = `#graphql
  enum ExamStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum ExamType {
    PLACEMENT
    MOCK
  }

  enum CertificateType {
    IELTS
    TOEIC
  }

  enum CertificateVariant {
    LR
    SW
    ACADEMIC
    GENERAL
  }

  """
  CEFR band a paper is aimed at. Separate from CefrLevel, which is a learner's
  own level - the backend keeps the two enums apart for the same reason.
  """
  enum TargetLevel {
    A1
    A2
    B1
    B2
    C1
    C2
  }

  type ExamListItem {
    id: ID!
    title: String!
    examType: ExamType!
    """
    Null on a paper with no certificate (e.g. a PLACEMENT exam) - the backend
    allows that combination, so this cannot be non-null.
    """
    certificateType: CertificateType
    certificateVariant: CertificateVariant
    targetLevel: TargetLevel
    status: ExamStatus!
    versionNumber: Int!
    createdByUserId: ID!
    publishedAt: DateTime
    createdAt: DateTime!
  }

  type ExamPage {
    items: [ExamListItem!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  """The full paper shell returned by create, update, publish and archive."""
  type Exam {
    id: ID!
    title: String!
    description: String!
    examType: ExamType!
    certificateType: CertificateType
    certificateVariant: CertificateVariant
    targetLevel: TargetLevel
    durationSeconds: Int!
    maxRawScore: Float!
    passScore: Float
    status: ExamStatus!
    versionNumber: Int!
    createdByUserId: ID!
    publishedAt: DateTime
  }

  type LearnerExamItem {
    id: ID!
    title: String!
    description: String!
    examType: ExamType!
    certificateType: CertificateType
    certificateVariant: CertificateVariant
    targetLevel: TargetLevel
    durationSeconds: Int!
    maxRawScore: Float!
    passScore: Float
    questionCount: Int!
    status: ExamStatus!
    publishedAt: DateTime
    bestScore: Float
    attemptStatus: String
  }

  type LearnerExamPage {
    items: [LearnerExamItem!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  extend type Query {
    """
    Admin catalogue search - returns drafts and archived papers too, so the
    backend restricts it to ADMIN. Sorted newest first by the backend.
    """
    adminExams(
      status: ExamStatus
      examType: ExamType
      title: String
      page: Int = 0
      size: Int = 20
    ): ExamPage!

    """
    Learner exam catalogue search - returns published exams.
    """
    exams(
      examType: ExamType
      certificateType: CertificateType
      certificateVariant: CertificateVariant
      targetLevel: TargetLevel
      title: String
      page: Int = 0
      size: Int = 20
    ): LearnerExamPage!

    """
    The placement paper, for a learner who does not know their level. Errors
    with NOT_FOUND when the deployment has no published placement exam, which
    is a normal state rather than a fault.
    """
    placementExam: LearnerExamItem!

    """Learner exam detail by id"""
    exam(id: ID!): LearnerExamItem

    """
    The paper to sit, reachable only through an open attempt. There is no
    lookup by exam id: the answer key is stripped per attempt, and handing out
    a paper without one would mean handing it out unscoped.
    """
    attemptPaper(attemptId: ID!): ExamPaper!

    """
    The scored attempt. Carries the answer key, so it is only worth reading
    once the attempt has left IN_PROGRESS.
    """
    examAttempt(id: ID!): ExamAttempt!
  }

  """
  An option as the learner sees it while sitting: no correctness flag and no
  explanation. Both arrive afterwards on AttemptOptionReview.
  """
  type QuestionOption {
    id: ID!
    content: String!
    orderNo: Int!
  }

  type ExamQuestion {
    id: ID!
    questionType: String!
    content: String!
    difficultyLevel: String!
    skillType: String!
    questionCategory: String
    orderNo: Int!
    maxRawScore: Float!
    options: [QuestionOption!]!
  }

  type ExamQuestionSet {
    id: ID!
    title: String
    instruction: String
    orderNo: Int!
    content: String
    """Pre-signed and short-lived - the backend resolves the object key for us."""
    audioUrl: String
    imageUrl: String
    questions: [ExamQuestion!]!
  }

  type ExamSectionPart {
    id: ID!
    orderNo: Int!
    title: String!
    instruction: String
    content: String
    audioUrl: String
    imageUrl: String
    questionSets: [ExamQuestionSet!]!
  }

  type ExamSectionDetail {
    id: ID!
    sectionType: String!
    orderNo: Int!
    maxRawScore: Float!
    scoredByCriteria: Boolean!
    timeLimitSeconds: Int
    parts: [ExamSectionPart!]!
  }

  type ExamPaper {
    id: ID!
    title: String!
    description: String!
    examType: ExamType!
    certificateType: CertificateType
    certificateVariant: CertificateVariant
    targetLevel: TargetLevel
    durationSeconds: Int!
    maxRawScore: Float!
    passScore: Float
    versionNumber: Int!
    sections: [ExamSectionDetail!]!
  }

  enum ExamAttemptStatus {
    IN_PROGRESS
    SCORED
    EXPIRED
  }

  type AttemptOptionReview {
    optionId: ID!
    correct: Boolean!
    explanation: String
  }

  type AttemptQuestionReview {
    questionId: ID!
    selectedOptionIds: [ID!]!
    correctOptionIds: [ID!]!
    correct: Boolean!
    awardedRawScore: Float!
    explanation: String
    options: [AttemptOptionReview!]!
  }

  type ExamAttempt {
    id: ID!
    examId: ID!
    status: ExamAttemptStatus!
    startedAt: DateTime!
    """
    The deadline the backend issued. This is the only authority on remaining
    time - a countdown from durationSeconds drifts across a sleeping laptop.
    """
    expiresAt: DateTime!
    submittedAt: DateTime
    scoredAt: DateTime
    """Null until the attempt is scored."""
    rawScore: Float
    maxRawScore: Float
    scorePercentage: Float
    correctAnswerCount: Int
    questionCount: Int!
    """True when the backend handed back an attempt that was already open."""
    resumed: Boolean!
    """Empty while the attempt is IN_PROGRESS - it carries the answer key."""
    questions: [AttemptQuestionReview!]!
  }

  input SubmitAnswerInput {
    questionId: ID!
    """Empty for a question the learner skipped; several for a multi-select."""
    selectedOptionIds: [ID!]!
  }

  extend type Mutation {
    """
    Opens an attempt, or returns the one already open with resumed: true. The
    backend enforces one live attempt per learner and exam, so calling this
    twice does not create two.
    """
    startExamAttempt(examId: ID!): ExamAttempt!

    """
    Submits and scores in one step. The backend rejects a submission after
    expiresAt, which is why the client must never decide expiry itself.
    """
    submitExamAttempt(
      attemptId: ID!
      answers: [SubmitAnswerInput!]!
    ): ExamAttempt!

    """
    DRAFT -> PUBLISHED. The backend refuses a paper that is not a draft, has
    no section or question, whose section scores do not total maxRawScore, or
    that has an ungradeable question - the reason arrives as
    extensions.backendCode on the error (e.g. EXAM_SCORE_MISMATCH).
    """
    publishExam(id: ID!): Exam!

    """
    DRAFT or PUBLISHED -> ARCHIVED. There is no delete; archiving is the
    retirement path. Archiving an already-archived paper fails with
    extensions.backendCode: EXAM_ALREADY_ARCHIVED.
    """
    archiveExam(id: ID!): Exam!
  }
`;
