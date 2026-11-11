export const assessmentTypeDefs = /* GraphQL */ `
  enum AssessmentSkill {
    WRITING
    SPEAKING
  }
  enum AssessmentTaskStatus {
    DRAFT
    PENDING_REVIEW
    REJECTED
    PUBLISHED
    ARCHIVED
  }
  enum AssessmentAttemptStatus {
    DRAFT
    QUEUED
    NEEDS_REVIEW
    COMPLETED
    FAILED
  }
  type AssessmentCapabilities {
    automaticWriting: Boolean!
    automaticSpeaking: Boolean!
    humanReview: Boolean!
  }
  type AssessmentReviewer { id: ID!, displayName: String! }
  type AssessmentAssignmentEntry { id: ID!, assignedByUserId: ID, reviewerId: ID, note: String!, createdAt: DateTime! }
  type AssessmentAssignment { attemptId: ID!, reviewerId: ID, reviewerName: String, version: Int!, history: [AssessmentAssignmentEntry!]! }
  enum AssessmentTaskPurpose {
    PRACTICE
    """
    The spoken part of the roadmap's level check (Speaking only). Kept out of
    the learner catalogue.
    """
    LEVEL_CHECK
  }
  type AssessmentTask {
    id: ID!
    skill: AssessmentSkill!
    title: String!
    taskType: String!
    instructions: String!
    rubricNotes: String
    sampleAnswer: String
    minimumWords: Int!
    timeLimitSeconds: Int!
    status: AssessmentTaskStatus!
    reviewNote: String
    version: Int!
    targetLevel: CefrLevel
    purpose: AssessmentTaskPurpose!
    certificateType: CertificateType
    """
    Writing Task 1's chart to describe, signed for a few hours. Uploaded through
    the REST authoring route (ASSESSMENT_TASK media), not GraphQL.
    """
    imageUrl: String
  }
  type AssessmentTaskPage {
    items: [AssessmentTask!]!
    page: Int!
    totalPages: Int!
    totalItems: Int!
  }
  type AssessmentAttempt {
    id: ID!
    taskId: ID!
    skill: AssessmentSkill!
    task: AssessmentTask!
    status: AssessmentAttemptStatus!
    answerText: String!
    audioUrl: String
    recognizedText: String
    report: String
    source: String
    errorCode: String
    wordCount: Int!
    version: Int!
    createdAt: DateTime!
    submittedAt: DateTime
    assessedAt: DateTime
    learnerId: ID
    learnerName: String
  }
  type AssessmentReview {
    id: ID!
    reviewerId: ID!
    reviewerName: String
    previousReport: String
    report: String!
    note: String!
    createdAt: DateTime!
  }
  type AssessmentWorkload {
    drafts: Int!
    rejected: Int!
    pendingReview: Int!
    published: Int!
    needsReview: Int!
    failed: Int!
    completed: Int!
  }
  type AssessmentSubmissionTask {
    id: ID!
    title: String!
  }
  type AssessmentSubmissionSummary {
    id: ID!
    skill: AssessmentSkill!
    status: AssessmentAttemptStatus!
    submittedAt: DateTime
    version: Int!
    learnerId: ID!
    learnerName: String
    task: AssessmentSubmissionTask!
  }
  type AssessmentSubmissionPage {
    items: [AssessmentSubmissionSummary!]!
    page: Int!
    totalPages: Int!
    totalItems: Int!
  }
  type AssessmentAttemptPage {
    items: [AssessmentAttempt!]!
    page: Int!
    totalPages: Int!
    totalItems: Int!
  }
  type AssessmentNotification {
    attemptId: ID!
    title: String!
    skill: AssessmentSkill!
    version: Int!
    assessedAt: DateTime!
  }
  type AssessmentNotificationPage {
    items: [AssessmentNotification!]!
    page: Int!
    totalPages: Int!
    totalItems: Int!
  }
  type AssessmentUpload {
    attempt: AssessmentAttempt!
    uploadUrl: String
  }
  input AssessmentTaskInput {
    skill: AssessmentSkill!
    title: String!
    taskType: String!
    instructions: String!
    rubricNotes: String
    sampleAnswer: String
    minimumWords: Int!
    timeLimitSeconds: Int!
    targetLevel: CefrLevel
    """
    Defaults to PRACTICE. LEVEL_CHECK is refused for a Writing task
    (TASK_PURPOSE_SKILL).
    """
    purpose: AssessmentTaskPurpose
    """
    Set for IELTS/TOEIC preparation; leave empty for general practice.
    """
    certificateType: CertificateType
  }
  extend type Query {
    assessmentAssignment(id: ID!): AssessmentAssignment!
    assessmentReviewers: [AssessmentReviewer!]!
    assessmentCapabilities: AssessmentCapabilities!
    assessmentTasks(skill: AssessmentSkill, page: Int): AssessmentTaskPage!
    assessmentTask(id: ID!): AssessmentTask!
    assessmentAttempt(id: ID!): AssessmentAttempt!
    assessmentNotifications(page: Int): AssessmentNotificationPage!
    assessmentHistory(
      taskId: ID
      skill: AssessmentSkill
      status: AssessmentAttemptStatus
      title: String
      page: Int
    ): AssessmentAttemptPage!
    authoringAssessmentTasks(
      skill: AssessmentSkill
      status: AssessmentTaskStatus
      page: Int
      "Tasks per page: 12 unless given, at most 100."
      size: Int
    ): AssessmentTaskPage!
    assessmentSubmissions(
      status: AssessmentAttemptStatus
      skill: AssessmentSkill
      term: String
      oldest: Boolean
      page: Int
    ): AssessmentSubmissionPage!
    assessmentSubmission(id: ID!): AssessmentAttempt!
    authoringAssessmentTask(id: ID!): AssessmentTask!
    assessmentReviews(id: ID!): [AssessmentReview!]!
    assessmentWorkload: AssessmentWorkload!
  }
  extend type Mutation {
    assignAssessment(id: ID!, reviewerId: ID, version: Int!, note: String!): AssessmentAssignment!
    readAssessmentResult(id: ID!, version: Int!): Boolean!
    startAssessment(
      taskId: ID!
      clientKey: ID!
      contentType: String
      contentLength: Int
    ): AssessmentUpload!
    saveAssessmentDraft(
      id: ID!
      answerText: String!
      version: Int!
    ): AssessmentAttempt!
    submitAssessment(id: ID!): AssessmentAttempt!
    retryAssessment(id: ID!): AssessmentAttempt!
    requestAssessmentReview(id: ID!): AssessmentAttempt!
    createAssessmentTask(input: AssessmentTaskInput!): AssessmentTask!
    editAssessmentTask(
      id: ID!
      version: Int!
      input: AssessmentTaskInput!
    ): AssessmentTask!
    "Drops a Writing Task 1's chart while the task is still a draft or rejected."
    removeAssessmentTaskImage(id: ID!): AssessmentTask!
    transitionAssessmentTask(
      id: ID!
      action: String!
      note: String
    ): AssessmentTask!
    gradeAssessment(
      id: ID!
      report: String!
      note: String!
      transcript: String
      version: Int!
    ): AssessmentAttempt!
  }
`;
