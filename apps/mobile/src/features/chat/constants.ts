/** Where the chat screens live. */
export const CHAT_ROUTES = {
  list: "/chat",
  conversation: (conversationId: string) =>
    `/chat/${encodeURIComponent(conversationId)}`,
  wall: (userId: string) => `/people/${encodeURIComponent(userId)}`,
  admin: "/admin",
} as const;

/* ---- Socket: reconnecting --------------------------------------------- */

/** First wait before reconnecting; it doubles with every failure in a row. */
export const BACKOFF_BASE_MS = 1_000;

/** The longest wait between two attempts, however many have failed. */
export const BACKOFF_MAX_MS = 30_000;

/** Up to this much is added to a wait, so every tab of a restarted server does not return in the same second. */
export const BACKOFF_JITTER_MS = 250;

/**
 * Tickets refused for lack of a session this many times in a row end the
 * attempts: the session is over, and signing in again is the sign-in flow's job.
 */
export const MAX_TICKET_AUTH_FAILURES = 3;

/**
 * Connections that never reached `open` this many times in a row end the
 * attempts. A handshake the server refuses on every try (a wrong Origin, a
 * rejected ticket) answers the same each time, so trying for ever only keeps a
 * tab asking. The backoff makes this about a minute and a half of trying, which
 * a restart of the backend does not outlast; a socket that did open starts the
 * count again.
 */
export const MAX_FAILED_CONNECTS = 8;

/**
 * The close code the backend ends the oldest socket with when a person opens
 * more than it allows (WebSocket "policy violation"). Reconnecting would only
 * push out another of their sockets, in a loop between two tabs, so it is final.
 */
export const SOCKET_CLOSE_POLICY_VIOLATION = 1008;

/* ---- Typing and reading ------------------------------------------------ */

/** While someone types, a "typing" signal goes out at most this often. */
export const TYPING_SEND_INTERVAL_MS = 3_000;

/** The viewer forgets "typing" this long after the last signal. Longer than the send interval, so a steady typist never flickers. */
export const TYPING_EXPIRE_MS = 5_000;

/** A new message waits this long before the conversation is marked read, so a burst makes one call. */
export const MARK_READ_DEBOUNCE_MS = 1_000;

/* ---- Keeping the lists fresh ------------------------------------------ */

/** The header asks again how many conversations hold something unread this often while the tab is showing. */
export const UNREAD_POLL_INTERVAL_MS = 60_000;

/** After a burst of frames the conversation list and the unread count are fetched once, this long after the last. */
export const REFRESH_DEBOUNCE_MS = 1_000;

/** Beyond this the header says "99+". */
export const UNREAD_BADGE_MAX = 99;

/* ---- Lists and history ------------------------------------------------- */

/** Conversations per page of the list. The backend allows up to 50. */
export const CONVERSATION_PAGE_SIZE = 30;

/** Messages per request. The backend's default is 50 and its cap 100. */
export const MESSAGE_PAGE_SIZE = 50;

/** A reconnect catches up in pages of this size, and gives up on more than this many pages (the next reload shows the rest). */
export const CATCH_UP_PAGE_SIZE = 100;
export const MAX_CATCH_UP_PAGES = 10;

/** Longest message the backend takes (SendMessageRequest), so the box says so while typing. */
export const MAX_MESSAGE_LENGTH = 4_000;

/** The counter under the box appears once the text is this close to the limit. */
export const MESSAGE_LENGTH_WARNING_AT = 3_600;

/* ---- Images ------------------------------------------------------------ */

/** What the backend accepts for a chat image: ChatImages.TYPES and ChatImages.MAX_BYTES. It decides; this only warns early. */
export const IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** The longest wait for the PUT to object storage. */
export const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

/* ---- Backend codes ----------------------------------------------------- */

/** Codes the screens branch on. Every other code shows its sentence from the translations, or the general one. */
export const BACKEND_CODES = {
  notFriends: "CHAT_NOT_FRIENDS",
  partnerGone: "CHAT_PARTNER_GONE",
  conversationNotFound: "CHAT_CONVERSATION_NOT_FOUND",
  alreadyRecalled: "CHAT_MESSAGE_ALREADY_RECALLED",
  messageEmpty: "CHAT_MESSAGE_EMPTY",
  messageTooLong: "CHAT_MESSAGE_TOO_LONG",
  imageNotUploaded: "CHAT_IMAGE_NOT_UPLOADED",
  imageUploadNotFound: "CHAT_IMAGE_UPLOAD_NOT_FOUND",
  imageTypeNotAllowed: "CHAT_IMAGE_TYPE_NOT_ALLOWED",
  imageTooLarge: "CHAT_IMAGE_TOO_LARGE",
  clientIdReused: "CHAT_CLIENT_ID_REUSED",
  learnersOnly: "CHAT_LEARNERS_ONLY",
} as const;

/** A refused send with one of these means the two can no longer talk: the box locks. */
export const CONVERSATION_LOCKING_CODES: ReadonlySet<string> = new Set([
  BACKEND_CODES.notFriends,
  BACKEND_CODES.partnerGone,
]);

/** Sending the same thing again cannot work after one of these, so the message offers no "send again". */
export const NON_RETRYABLE_SEND_CODES: ReadonlySet<string> = new Set([
  ...CONVERSATION_LOCKING_CODES,
  BACKEND_CODES.conversationNotFound,
  BACKEND_CODES.messageEmpty,
  BACKEND_CODES.messageTooLong,
  BACKEND_CODES.imageUploadNotFound,
  BACKEND_CODES.imageTypeNotAllowed,
  BACKEND_CODES.imageTooLarge,
  BACKEND_CODES.clientIdReused,
  BACKEND_CODES.learnersOnly,
]);

/** The operation names of the queries a message or a read mark changes the answer of. */
export const LIST_QUERY_NAMES: ReadonlySet<string> = new Set([
  "ChatConversations",
  "ChatUnreadCount",
]);

/** Why the box cannot be written in: the two are no longer friends, or the other person erased their account. */
export const CONVERSATION_LOCK = {
  notFriends: "notFriends",
  partnerGone: "partnerGone",
} as const;

export type ConversationLock =
  (typeof CONVERSATION_LOCK)[keyof typeof CONVERSATION_LOCK];

/** Which sentence of the composer's copy explains each lock: a Record, so a new reason is a type error until it has words. */
export const CONVERSATION_LOCK_SENTENCE: Record<
  ConversationLock,
  "lockedNotFriends" | "lockedPartnerGone"
> = {
  [CONVERSATION_LOCK.notFriends]: "lockedNotFriends",
  [CONVERSATION_LOCK.partnerGone]: "lockedPartnerGone",
};
