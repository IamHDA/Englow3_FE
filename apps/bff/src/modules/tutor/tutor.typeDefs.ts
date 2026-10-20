export const tutorTypeDefs = /* GraphQL */ `
  enum TutorMessageRole {
    USER
    ASSISTANT
  }

  """
  Whether a turn has something to show yet. Only the tutor's side is ever
  PENDING; the learner's own message is READY the moment it arrives.
  """
  enum TutorMessageStatus {
    PENDING
    READY
    FAILED
    CANCELLED
  }

  type TutorMessage {
    id: ID!
    orderNo: Int!
    role: TutorMessageRole!
    status: TutorMessageStatus!
    """
    Null while a reply is pending. Nullable on purpose: a screen has to tell
    "still thinking" from "answered with nothing", and an empty string for both
    would make that impossible.
    """
    content: String
    "Why no answer came, when none did."
    errorCode: String
    model: String
    reported: Boolean!
    createdAt: DateTime!
    answeredAt: DateTime
    revision: Int!
    restartCount: Int!
    summary: Boolean
    correction: String
    reportStatus: String
    sources: [TutorSource!]!
  }

  type TutorConversationSummary {
    id: ID!
    "Taken from the first thing the learner said, so the list reads as what they asked."
    title: String!
    topic: String
    messageCount: Int!
    lastMessageAt: DateTime!
    createdAt: DateTime!
    archivedAt: DateTime
    useLearningContext: Boolean!
    quizAttemptId: ID
    quizQuestionId: ID
    assessmentAttemptId: ID
    examAttemptId: ID
    examQuestionId: ID
  }

  type TutorConversation {
    conversation: TutorConversationSummary!
    messages: [TutorMessage!]!
  }

  type TutorFailureCount { code: String!, count: Int! }
  type TutorQueueMetrics { samples: Int!, queueP95Ms: Float, completionP95Ms: Float, knownInputTokens: Float!, knownOutputTokens: Float!, unknownUsageJobs: Int!, failures: [TutorFailureCount!]! }
  type TutorOperations { pending: Int!, running: Int!, completedToday: Int!, failedToday: Int!, oldestPendingAt: DateTime, scope: String!, metrics: TutorQueueMetrics }
  type TutorSource { label: String!, resourceId: ID!, title: String!, versionNumber: Int!, excerpt: String! }
  type TutorResource { id: ID!, documentId: ID!, versionNumber: Int!, title: String!, body: String!, status: String!, authorId: ID!, reviewNote: String, rowVersion: Int! }
  type TutorResourcePage { items: [TutorResource!]!, page: Int!, size: Int!, totalItems: Int!, totalPages: Int! }
  type TutorReport { id: ID!, messageId: ID!, revision: Int!, question: String, answer: String, learnerNote: String, status: String!, assignedTo: ID, reviewerNote: String, correction: String, createdAt: DateTime!, resolvedAt: DateTime }
  type TutorReportPage { items: [TutorReport!]!, page: Int!, size: Int!, totalItems: Int!, totalPages: Int! }
  type TutorStaffMember { id: ID!, displayName: String! }
  input TutorResourceInput { title: String!, body: String!, rowVersion: Int = 0 }
  input TutorReviewInput { action: String!, assignedTo: ID, note: String, correction: String }
  type TutorPolicy { accepting: Boolean!, allowedModes: [String!]!, version: Int!, environmentEnabled: Boolean!, model: String!, dailyLimit: Int!, streamingEnabled: Boolean!, voiceEnabled: Boolean! }
  input TutorPolicyInput { accepting: Boolean!, allowedModes: [String!]!, version: Int!, reason: String! }
  type TutorUsage {
    enabled: Boolean!
    limit: Int!
    used: Int!
    remaining: Int!
    resetsAt: DateTime!
    maxMessageLength: Int!
    streaming: Boolean!
    voice: Boolean!
    allowedModes: [String!]!
    supportedContexts: [String!]!
    memorySupported: Boolean!
  }
  type TutorHistoryPage {
    items: [TutorConversationSummary!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }
  type TutorMessagePage {
    conversation: TutorConversationSummary!
    messages: [TutorMessage!]!
    page: Int!
    totalPages: Int!
    totalElements: Int!
  }
  type TutorMemory { enabled: Boolean!, content: String, throughOrder: Int!, remainingMessages: Int!, pendingMessageId: ID, batchSize: Int! }
  type TutorReplyVersion { revision: Int!, status: String!, content: String, model: String, correction: String }
  type TutorReplyHistory { currentRevision: Int!, canSelect: Boolean!, items: [TutorReplyVersion!]! }
  extend type Query {
    tutorMemory(conversationId: ID!): TutorMemory!
    tutorPolicy: TutorPolicy!
    tutorReplyHistory(conversationId: ID!, messageId: ID!): TutorReplyHistory!
    tutorOperations: TutorOperations!
    tutorUsage: TutorUsage!
    tutorResources(status: String = "", page: Int = 0): TutorResourcePage!
    tutorResource(id: ID!): TutorResource!
    tutorReports(status: String = "", page: Int = 0): TutorReportPage!
    tutorReport(id: ID!): TutorReport!
    tutorStaffMembers: [TutorStaffMember!]!
    tutorReceipt(clientMessageId: ID!): TutorConversation!
    tutorHistory(page: Int = 0, size: Int = 20, search: String = "", archived: Boolean = false): TutorHistoryPage!
    tutorMessages(id: ID!, page: Int = 0, size: Int = 30): TutorMessagePage!
    tutorReply(conversationId: ID!, messageId: ID!): TutorMessage!
    tutorConversations: [TutorConversationSummary!]!
    tutorConversation(id: ID!): TutorConversation!
  }

  extend type Mutation {
    summarizeTutorConversation(conversationId: ID!,clientMessageId: ID!): TutorConversation!
    clearTutorMemory(conversationId: ID!): Boolean!
    updateTutorPolicy(input: TutorPolicyInput!): TutorPolicy!
    selectTutorReply(conversationId: ID!, messageId: ID!, revision: Int!, clientMessageId: ID!): TutorConversation!
    branchTutorConversation(conversationId: ID!, messageId: ID!, message: String!, clientMessageId: ID!, personalized: Boolean): TutorConversation!
    createTutorResource(input: TutorResourceInput!): TutorResource!
    updateTutorResource(id: ID!, input: TutorResourceInput!): TutorResource!
    reviewTutorResource(id: ID!, input: TutorReviewInput!): TutorResource!
    reviewTutorReport(id: ID!, input: TutorReviewInput!): TutorReport!
    """
    Sends a question. Omit conversationId to start a new thread - whether one
    already exists is not the learner's concern.
    """
    sendTutorMessage(
      conversationId: ID
      message: String!
      topic: String
      clientMessageId: ID
      mode: String
      personalized: Boolean
      quizAttemptId: ID
      quizQuestionId: ID
      assessmentAttemptId: ID
      examAttemptId: ID
      examQuestionId: ID
    ): TutorConversation!

    archiveTutorConversation(id: ID!): TutorConversationSummary!
    restoreTutorConversation(id: ID!): TutorConversationSummary!
    renameTutorConversation(id: ID!, title: String!): TutorConversationSummary!
    retryTutorReply(conversationId: ID!, messageId: ID!, clientMessageId: ID!): TutorConversation!
    regenerateTutorReply(conversationId: ID!, messageId: ID!, clientMessageId: ID!): TutorConversation!
    cancelTutorReply(conversationId: ID!, messageId: ID!): TutorMessage!

    "Reports an answer as wrong or inappropriate. The note is optional."
    reportTutorMessage(
      conversationId: ID!
      messageId: ID!
      note: String
    ): TutorMessage!
  }
`;
