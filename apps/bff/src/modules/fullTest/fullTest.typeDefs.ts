export const fullTestTypeDefs = /* GraphQL */ `
  """
  An IELTS full test: one Listening + Reading paper and five Writing and
  Speaking tasks, sat as one test with one overall band. It is the IELTS
  learner's placement test and is also in the catalogue. Reviewed like a paper.
  """
  type FullTest {
    id: ID!
    title: String!
    description: String!
    certificateVariant: CertificateVariant!
    "The Listening + Reading mock paper, sat through startExamAttempt."
    examId: ID!
    writingTask1Id: ID!
    writingTask2Id: ID!
    speakingPart1Id: ID!
    speakingPart2Id: ID!
    speakingPart3Id: ID!
    status: ExamStatus!
    reviewNote: String
    publishedAt: DateTime
    version: Int!
  }

  enum FullTestSittingStatus {
    "Parts may still be taken, until deadlineAt."
    IN_PROGRESS
    "Every part is in; at least one is not graded yet."
    AWAITING_GRADES
    "Every part graded; overallBand is set."
    COMPLETED
    """
    The seven days ran out with parts missing, or grading was still missing at
    gradesDueAt; provisionalBand stays.
    """
    EXPIRED
  }

  enum FullTestSlot {
    WRITING_TASK_1
    WRITING_TASK_2
    SPEAKING_PART_1
    SPEAKING_PART_2
    SPEAKING_PART_3
  }

  "How grading of a part's attached answer stands."
  enum FullTestPartGrading {
    "Queued for the automatic grader."
    GRADING
    "Waiting for a person to grade it."
    AWAITING_REVIEW
    "The automatic grader gave up; resend it or ask for a person."
    FAILED
    GRADED
  }

  "One Writing or Speaking part: the task to answer, and the answer attached."
  type FullTestPart {
    slot: FullTestSlot!
    taskId: ID!
    "Null until an answer submitted since the sitting began is picked up."
    attemptId: ID
    "Null with no answer attached, and in myFullTestSittings."
    grading: FullTestPartGrading
  }

  type FullTestSitting {
    id: ID!
    fullTestId: ID!
    title: String!
    status: FullTestSittingStatus!
    startedAt: DateTime!
    "Every part must be submitted by then; grading may finish later."
    deadlineAt: DateTime!
    """
    A sitting still missing a grade then expires and keeps its provisional
    band (a week after deadlineAt).
    """
    gradesDueAt: DateTime!
    completedAt: DateTime
    "The paper to sit in full."
    examId: ID!
    examAttemptId: ID
    parts: [FullTestPart!]!
    listeningBand: Float
    readingBand: Float
    writingBand: Float
    speakingBand: Float
    """
    The lower of Listening and Reading, shown as an estimate until overallBand
    exists. It is also recorded as the learner's level.
    """
    provisionalBand: Float
    overallBand: Float
  }

  input SaveFullTestInput {
    title: String!
    description: String
    certificateVariant: CertificateVariant!
    examId: ID!
    writingTask1Id: ID!
    writingTask2Id: ID!
    speakingPart1Id: ID!
    speakingPart2Id: ID!
    speakingPart3Id: ID!
  }

  extend type Query {
    "Published full tests, newest first."
    fullTests: [FullTest!]!
    myFullTestSittings: [FullTestSitting!]!
    "Brought up to date with every part graded so far."
    fullTestSitting(id: ID!): FullTestSitting!
    adminFullTests: [FullTest!]!
    adminFullTest(id: ID!): FullTest!
  }

  extend type Mutation {
    """
    Starts a sitting, or returns the one still open. Refused with
    extensions.backendCode FULL_TEST_IELTS_ONLY for a learner not preparing
    for IELTS.
    """
    startFullTest(fullTestId: ID!): FullTestSitting!
    "Creates a draft when id is omitted. Components are checked at review."
    saveFullTest(id: ID, input: SaveFullTestInput!): FullTest!
    """
    DRAFT or REJECTED -> PENDING_REVIEW. Refused with FULL_TEST_PAPER_INVALID,
    FULL_TEST_TASK_INVALID or FULL_TEST_TASK1_NEEDS_CHART when a component is
    not a published IELTS one of the right kind.
    """
    submitFullTestForReview(id: ID!): FullTest!
    "PENDING_REVIEW -> PUBLISHED, administrators only."
    approveFullTest(id: ID!): FullTest!
    "PENDING_REVIEW -> REJECTED, administrators only; the note is required."
    rejectFullTest(id: ID!, note: String!): FullTest!
    archiveFullTest(id: ID!): FullTest!
  }
`;
