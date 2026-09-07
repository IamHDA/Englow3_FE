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
