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
<<<<<<< Updated upstream
=======

    """
    Learner exam catalogue search - returns published exams.
    """
    exams(
      examType: ExamType
      certificateType: CertificateType
      certificateVariant: CertificateVariant
      targetLevel: TargetLevel
      title: String
      sortBy: ExamSortBy = NEWEST
      page: Int = 0
      size: Int = 20
    ): LearnerExamPage!

    """
    The placement paper, for a learner who does not know their level. Errors
    with NOT_FOUND when the deployment has no published placement exam, which
    is a normal state rather than a fault.
    """
    placementExam: LearnerExamItem!

    """
    Learner exam detail by id
    """
    exam(id: ID!): LearnerExamItem

    """
    The paper to sit, reachable only through an open attempt. There is no
    lookup by exam id: the answer key is stripped per attempt, and handing out
    a paper without one would mean handing it out unscoped.
    """
    attemptPaper(attemptId: ID!): ExamPaper!

    """
    The paper's skills and parts with how many questions each holds - what a
    practice is picked from. No question content.
    """
    examOutline(examId: ID!): ExamOutline!
    activeExamAttempt(examId: ID!, mode: ExamAttemptMode!): ExamAttempt

    """
    The scored attempt. Carries the answer key, so it is only worth reading
    once the attempt has left IN_PROGRESS.
    """
    examAttempt(id: ID!): ExamAttempt!

    """
    The learner's own sittings, newest first. Rows carry no review - that
    structure holds the answer key.
    """
    examAttempts(page: Int = 0, size: Int = 20): ExamAttemptPage!
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
    """
    Pre-signed and short-lived - the backend resolves the object key for us.
    """
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

  """
  FULL is the real sitting: every part on the paper's own clock, and the only
  mode that counts toward progress, the best score and placement. PRACTICE
  covers chosen parts on a clock the learner picked, or none.
  """
  enum ExamAttemptMode {
    FULL
    PRACTICE
  }

  """
  What to do when another attempt at this exam is already open.
  """
  enum OpenAttemptChoice {
    """
    Keep the open attempt and return it.
    """
    RESUME
    """
    Finalize the open attempt from its saved answers, then start the new one.
    """
    REPLACE
  }

  input StartExamAttemptInput {
    mode: ExamAttemptMode
    """
    Parts a practice covers. Ignored for FULL.
    """
    partIds: [ID!]
    """
    A practice's clock, 1-300 minutes; null for none. Ignored for FULL.
    """
    timeLimitMinutes: Int
    """
    Without it, an open attempt that is not the one asked for fails with
    extensions.backendCode: ATTEMPT_IN_PROGRESS so the learner can choose.
    """
    onOpen: OpenAttemptChoice
  }

  type ExamOutline {
    examId: ID!
    sections: [ExamOutlineSection!]!
  }

  type ExamOutlineSection {
    id: ID!
    sectionType: String!
    orderNo: Int!
    parts: [ExamOutlinePart!]!
  }

  type ExamOutlinePart {
    id: ID!
    orderNo: Int!
    title: String!
    questionCount: Int!
  }

  """
  A part a practice covered.
  """
  type AttemptPart {
    id: ID!
    sectionType: String
    title: String
  }

  type ExamAttempt {
    id: ID!
    examId: ID!
    status: ExamAttemptStatus!
    mode: ExamAttemptMode!
    """
    Null only for an untimed practice; expiresAt is then a far safety net and
    the client shows no countdown.
    """
    timeLimitSeconds: Int
    """
    Parts a practice covers; empty for a full attempt.
    """
    parts: [AttemptPart!]!
    startedAt: DateTime!
    """
    The deadline the backend issued. This is the only authority on remaining
    time - a countdown from durationSeconds drifts across a sleeping laptop.
    """
    expiresAt: DateTime!
    submittedAt: DateTime
    scoredAt: DateTime
    """
    Null until the attempt is scored.
    """
    rawScore: Float
    maxRawScore: Float!
    scorePercentage: Float
    correctAnswerCount: Int
    questionCount: Int!
    """
    True when the backend handed back an attempt that was already open.
    """
    resumed: Boolean!
    """
    Null except on a history row - a sitting knows its own paper's name.
    """
    examTitle: String
    """
    Empty while the attempt is IN_PROGRESS - it carries the answer key.
    """
    questions: [AttemptQuestionReview!]!
  }

  type ExamAttemptPage {
    items: [ExamAttempt!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  input SubmitAnswerInput {
    questionId: ID!
    """
    Empty for a question the learner skipped; several for a multi-select.
    """
    selectedOptionIds: [ID!]!
  }

  type ExamDraftAnswer {
    questionId: ID!
    selectedOptionIds: [ID!]!
  }
  type ExamDraft {
    answers: [ExamDraftAnswer!]!
    version: Int!
    savedAt: DateTime!
  }
  extend type Query {
    examDraft(attemptId: ID!): ExamDraft!
>>>>>>> Stashed changes
  }

  extend type Mutation {
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
