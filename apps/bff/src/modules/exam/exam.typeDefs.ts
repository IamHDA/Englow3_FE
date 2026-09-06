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
    certificateType: CertificateType!
    certificateVariant: CertificateVariant!
    targetLevel: TargetLevel!
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
  }
`;
