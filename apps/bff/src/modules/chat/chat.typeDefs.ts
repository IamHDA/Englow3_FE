export const chatTypeDefs = /* GraphQL */ `
  """
  Every sequence number in this module - seq, lastSeq, lastReadSeq, upToSeq,
  afterSeq, beforeSeq and the unread count (a difference of two of them) - is a
  Float, on purpose. The backend counts them as 64-bit and GraphQL's Int is
  32-bit; a Float carries a whole number exactly up to 2^53, far more than a
  conversation will ever hold. One choice for all of them, so a seq read from
  one field can be sent back through another without a conversion.
  """
  type ChatOtherUser {
    userId: ID!
    displayName: String!
    avatarUrl: String
  }

  type ChatLastMessage {
    seq: Float!
    """
    Null for a deleted user.
    """
    senderId: ID
    """
    Null once recalled, and for an image without text.
    """
    preview: String
    hasImage: Boolean!
    recalled: Boolean!
    sentAt: DateTime!
  }

  type ChatConversation {
    id: ID!
    """
    Null when the other person erased their account: the conversation stays,
    as "a deleted user".
    """
    otherUser: ChatOtherUser
    lastSeq: Float!
    lastReadSeq: Float!
    """
    max(0, lastSeq - lastReadSeq).
    """
    unreadCount: Float!
    """
    Null for a conversation nobody has written in yet.
    """
    lastMessage: ChatLastMessage
    """
    Set only when one conversation is asked for or opened, null in the list.
    False once the two are no longer friends (history stays readable).
    """
    canSend: Boolean
  }

  type ChatConversationPage {
    items: [ChatConversation!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type ChatMessage {
    id: ID!
    conversationId: ID!
    seq: Float!
    """
    Null for a deleted user.
    """
    senderId: ID
    """
    Null once recalled.
    """
    body: String
    """
    A link that expires after an hour. Null once recalled, and for text only.
    """
    imageUrl: String
    recalled: Boolean!
    sentAt: DateTime!
    """
    Only on the caller's own messages.
    """
    clientId: String
  }

  """
  Where to PUT the image bytes (with the same content type), then send a
  message naming uploadId.
  """
  type ChatImageUpload {
    uploadId: ID!
    uploadUrl: String!
    contentType: String!
    expiresInSeconds: Int!
  }

  """
  Opens one chat socket, once, within expiresInSeconds. A new one is made on
  every call; never keep or log it.
  """
  type ChatSocketTicket {
    ticket: String!
    expiresInSeconds: Int!
  }

  extend type Query {
    """
    The caller's conversations that have a message, newest first.
    """
    chatConversations(page: Int, size: Int): ChatConversationPage!
    """
    One conversation, with canSend. Fails with extensions.backendCode
    CHAT_CONVERSATION_NOT_FOUND when it does not exist or is not the caller's.
    """
    chatConversation(id: ID!): ChatConversation!
    """
    Messages in ascending seq order, at most 100. afterSeq catches up after a
    reconnect, beforeSeq scrolls back, neither gives the newest; giving both is
    refused (CHAT_HISTORY_CURSOR_CONFLICT).
    """
    chatMessages(
      conversationId: ID!
      afterSeq: Float
      beforeSeq: Float
      limit: Int
    ): [ChatMessage!]!
    """
    How many conversations hold something unread - the badge, not a count of
    messages.
    """
    chatUnreadCount: Int!
  }

  extend type Mutation {
    """
    Opens the conversation with a friend, or returns the one they already have.
    """
    openChat(friendId: ID!): ChatConversation!
    """
    Sends a message. clientId is chosen by the caller for each message and kept
    when it retries, so a retry returns the first message instead of sending a
    second. At least one of body and imageUploadId is needed.
    """
    sendChatMessage(
      conversationId: ID!
      clientId: String!
      body: String
      imageUploadId: ID
    ): ChatMessage!
    markChatRead(conversationId: ID!, upToSeq: Float!): Boolean!
    """
    Only the sender, once. Fails with CHAT_MESSAGE_ALREADY_RECALLED the second time.
    """
    recallChatMessage(messageId: ID!): ChatMessage!
    startChatImageUpload(
      conversationId: ID!
      contentType: String!
      contentLength: Int!
    ): ChatImageUpload!
    """
    A mutation, not a query: every call makes a new single-use ticket, which
    must never be served from a cache.
    """
    chatSocketTicket: ChatSocketTicket!
  }
`;
