export const tutorTypeDefs = `#graphql
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
  }

  type TutorConversationSummary {
    id: ID!
    "Taken from the first thing the learner said, so the list reads as what they asked."
    title: String!
    topic: String
    messageCount: Int!
    lastMessageAt: DateTime!
    createdAt: DateTime!
  }

  type TutorConversation {
    conversation: TutorConversationSummary!
    messages: [TutorMessage!]!
  }

  extend type Query {
    tutorConversations: [TutorConversationSummary!]!
    tutorConversation(id: ID!): TutorConversation!
  }

  extend type Mutation {
    """
    Sends a question. Omit conversationId to start a new thread - whether one
    already exists is not the learner's concern.
    """
    sendTutorMessage(
      conversationId: ID
      message: String!
      topic: String
    ): TutorConversation!

    archiveTutorConversation(id: ID!): TutorConversationSummary!

    "Reports an answer as wrong or inappropriate. The note is optional."
    reportTutorMessage(
      conversationId: ID!
      messageId: ID!
      note: String
    ): TutorMessage!
  }
`;
