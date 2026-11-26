import type { ChatMessageData } from "../types";

/** The `type` of every frame the server sends down the chat socket (ChatSocketFrame in the backend). */
export const FRAME_TYPE = {
  message: "message",
  recalled: "recalled",
  read: "read",
  typing: "typing",
} as const;

/**
 * What the server pushes. A new message has the shape of the REST answer; the
 * rest name a conversation and what changed in it. Nothing here is a message
 * the client has to trust blindly: a frame that does not fit is dropped.
 */
export type ChatFrame =
  | { type: typeof FRAME_TYPE.message; message: ChatMessageData }
  | {
      type: typeof FRAME_TYPE.recalled;
      conversationId: string;
      messageId: string;
      seq: number;
    }
  | {
      type: typeof FRAME_TYPE.read;
      conversationId: string;
      userId: string;
      upToSeq: number;
    }
  | {
      type: typeof FRAME_TYPE.typing;
      conversationId: string;
      userId: string;
      active: boolean;
    };

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isWholeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** A field that is a string or null; a missing one is null. Anything else is not a message. */
function nullableString(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  return isString(value) ? value : undefined;
}

function parseMessage(value: unknown): ChatMessageData | null {
  if (!isRecord(value)) return null;
  const { id, conversationId, seq, recalled, sentAt } = value;
  const senderId = nullableString(value.senderId);
  const body = nullableString(value.body);
  const imageUrl = nullableString(value.imageUrl);
  const clientId = nullableString(value.clientId);
  if (
    !isString(id) ||
    !isString(conversationId) ||
    !isWholeNumber(seq) ||
    typeof recalled !== "boolean" ||
    !isString(sentAt) ||
    senderId === undefined ||
    body === undefined ||
    imageUrl === undefined ||
    clientId === undefined
  ) {
    return null;
  }
  return {
    id,
    conversationId,
    seq,
    senderId,
    body,
    imageUrl,
    recalled,
    sentAt,
    clientId,
  };
}

/**
 * Reads one socket message. Anything that is not a frame this client knows -
 * broken JSON, a type from a newer server, a field of the wrong kind - is null,
 * and the caller carries on: a socket that threw on a frame it did not
 * recognise would be taken down by the first thing the backend adds.
 */
export function parseFrame(raw: unknown): ChatFrame | null {
  let data: unknown = raw;
  if (isString(raw)) {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!isRecord(data)) return null;

  switch (data.type) {
    case FRAME_TYPE.message: {
      const message = parseMessage(data.message);
      return message ? { type: FRAME_TYPE.message, message } : null;
    }
    case FRAME_TYPE.recalled:
      return isString(data.conversationId) &&
        isString(data.messageId) &&
        isWholeNumber(data.seq)
        ? {
            type: FRAME_TYPE.recalled,
            conversationId: data.conversationId,
            messageId: data.messageId,
            seq: data.seq,
          }
        : null;
    case FRAME_TYPE.read:
      return isString(data.conversationId) &&
        isString(data.userId) &&
        isWholeNumber(data.upToSeq)
        ? {
            type: FRAME_TYPE.read,
            conversationId: data.conversationId,
            userId: data.userId,
            upToSeq: data.upToSeq,
          }
        : null;
    case FRAME_TYPE.typing:
      return isString(data.conversationId) &&
        isString(data.userId) &&
        typeof data.active === "boolean"
        ? {
            type: FRAME_TYPE.typing,
            conversationId: data.conversationId,
            userId: data.userId,
            active: data.active,
          }
        : null;
    default:
      return null;
  }
}

/**
 * The one thing a client sends down the socket: "I am typing in this
 * conversation" or "I stopped". Everything else goes over GraphQL.
 */
export function typingPayload(conversationId: string, active: boolean): string {
  return JSON.stringify({ conversationId, active });
}
