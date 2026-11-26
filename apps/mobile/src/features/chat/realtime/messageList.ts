import type { ChatMessageData } from "../types";

/**
 * Where a message of the viewer's own stands. Only the viewer's messages are
 * ever anything but `sent`.
 *
 * - `sending`: shown at once, not confirmed yet.
 * - `failed`: not delivered, and sending it again may work (no connection, a
 *   busy server).
 * - `rejected`: not delivered, and sending it again cannot work (the two are no
 *   longer friends, the text is too long): it can only be dismissed.
 */
export const DELIVERY = {
  sent: "sent",
  sending: "sending",
  failed: "failed",
  rejected: "rejected",
} as const;

export type Delivery = (typeof DELIVERY)[keyof typeof DELIVERY];

/** One message as the list shows it: what the backend said, or what the viewer just wrote and awaits an answer for. */
export type ChatMessageEntry = {
  /** Stable for the life of the message, so the row is not rebuilt when the real message replaces the optimistic one. */
  key: string;
  /** Null until the backend has confirmed the message. */
  id: string | null;
  /** Null until the backend has numbered the message: it is shown last. */
  seq: number | null;
  senderId: string | null;
  body: string | null;
  imageUrl: string | null;
  recalled: boolean;
  sentAt: string;
  /** Only on the viewer's own messages. */
  clientId: string | null;
  delivery: Delivery;
  /** The backend code of the refusal that ended a send, when there was one. */
  failureCode: string | null;
};

/**
 * Whether the viewer wrote this message. The backend marks it itself: a message
 * carries its `clientId` only to the person who sent it (ChatMessageResult), and
 * every message has one. That is the whole rule - the id of the signed-in
 * account is no use here, since the Supabase id the session holds is not the
 * user id the backend writes into `senderId`.
 */
export function isOwnMessage(
  entry: Pick<ChatMessageEntry, "clientId">,
): boolean {
  return entry.clientId !== null;
}

/** A confirmed message as an entry. */
export function entryFromMessage(message: ChatMessageData): ChatMessageEntry {
  return {
    key: message.id,
    id: message.id,
    seq: message.seq,
    senderId: message.senderId,
    body: message.body,
    imageUrl: message.imageUrl,
    recalled: message.recalled,
    sentAt: message.sentAt,
    clientId: message.clientId,
    delivery: DELIVERY.sent,
    failureCode: null,
  };
}

/** What the viewer just wrote, before the backend has heard of it. */
export function optimisticEntry(input: {
  clientId: string;
  body: string | null;
  imageUrl: string | null;
  sentAt: string;
}): ChatMessageEntry {
  return {
    key: input.clientId,
    id: null,
    seq: null,
    // Not known until the backend answers - and not needed: it is the viewer's.
    senderId: null,
    body: input.body,
    imageUrl: input.imageUrl,
    recalled: false,
    sentAt: input.sentAt,
    clientId: input.clientId,
    delivery: DELIVERY.sending,
    failureCode: null,
  };
}

/** A recalled message keeps neither its text nor its image, here or anywhere on screen. */
function recalledCopy(entry: ChatMessageEntry): ChatMessageEntry {
  return { ...entry, recalled: true, body: null, imageUrl: null };
}

/**
 * Entries in ascending seq. Entries the backend has not numbered yet are the
 * viewer's own, still on their way, and go last in the order they were written.
 * (Array.prototype.sort is stable, so equal places keep their order.)
 */
export function sortEntries(entries: ChatMessageEntry[]): ChatMessageEntry[] {
  const place = (entry: ChatMessageEntry) =>
    entry.seq ?? Number.POSITIVE_INFINITY;
  return [...entries].sort((a, b) =>
    place(a) === place(b) ? 0 : place(a) < place(b) ? -1 : 1,
  );
}

/**
 * Whether two entries are the same message: the same id, or an own message
 * still waiting for its id and the confirmation that carries its clientId (in
 * either order - a history page can already hold a message whose send has not
 * answered yet).
 */
function isSameMessage(a: ChatMessageEntry, b: ChatMessageEntry): boolean {
  if (a.id !== null && a.id === b.id) return true;
  return (
    a.clientId !== null &&
    a.clientId === b.clientId &&
    (a.id === null || b.id === null)
  );
}

/**
 * Puts `incoming` into `base` and returns the list in order. A message that is
 * already there - the same id, or the real copy of an optimistic one by its
 * clientId - replaces it and keeps its key; a new one is added. So a message
 * that arrives twice (a frame, then the catch-up after a reconnect, then the
 * answer to the send) is in the list once.
 *
 * Recalling is a one-way door: once an entry is recalled, an older copy that
 * says otherwise - a page fetched before the recall - cannot undo it.
 */
export function mergeEntries(
  base: ChatMessageEntry[],
  incoming: ChatMessageEntry[],
): ChatMessageEntry[] {
  const result = [...base];
  for (const next of incoming) {
    const at = result.findIndex((existing) => isSameMessage(existing, next));
    if (at === -1) {
      result.push(next);
      continue;
    }
    const existing = result[at];
    // An unconfirmed copy never replaces a confirmed one.
    if (!existing || (next.id === null && existing.id !== null)) continue;
    const merged: ChatMessageEntry = {
      ...next,
      key: existing.key,
      recalled: existing.recalled || next.recalled,
    };
    result[at] = merged.recalled ? recalledCopy(merged) : merged;
  }
  return sortEntries(result);
}

/** The message with this id is recalled; unknown ids change nothing. */
export function applyRecall(
  entries: ChatMessageEntry[],
  messageId: string,
): ChatMessageEntry[] {
  return entries.map((entry) =>
    entry.id === messageId && !entry.recalled ? recalledCopy(entry) : entry,
  );
}

/** A send that did not go through. Only an entry still waiting for its confirmation can fail: one the backend already confirmed has been delivered, whatever a late error says. */
export function markFailed(
  entries: ChatMessageEntry[],
  clientId: string,
  failure: { code: string | null; retryable: boolean },
): ChatMessageEntry[] {
  return entries.map((entry) =>
    entry.id === null && entry.clientId === clientId
      ? {
          ...entry,
          delivery: failure.retryable ? DELIVERY.failed : DELIVERY.rejected,
          failureCode: failure.code,
        }
      : entry,
  );
}

/** A failed message is being sent again. */
export function markSending(
  entries: ChatMessageEntry[],
  clientId: string,
): ChatMessageEntry[] {
  return entries.map((entry) =>
    entry.id === null && entry.clientId === clientId
      ? { ...entry, delivery: DELIVERY.sending, failureCode: null }
      : entry,
  );
}

export function removeEntry(
  entries: ChatMessageEntry[],
  key: string,
): ChatMessageEntry[] {
  return entries.filter((entry) => entry.key !== key);
}

/** The highest seq the backend has numbered among the entries, or null when there is none. */
export function highestSeq(entries: ChatMessageEntry[]): number | null {
  let highest: number | null = null;
  for (const { seq } of entries) {
    if (seq !== null && (highest === null || seq > highest)) highest = seq;
  }
  return highest;
}

/**
 * Where the unbroken run of seqs that starts at the lowest one held ends, or
 * null when none is held. A conversation's seqs have no gaps (1, 2, 3...) and a
 * message is never removed, so the seq after this one - if the list holds
 * anything higher - is a message the viewer has not been given: the first
 * thing to ask the backend for. `highestSeq` is not that place: a frame that
 * arrives after a reconnect, or after one failed push, sits above a hole.
 */
export function contiguousHighSeq(entries: ChatMessageEntry[]): number | null {
  const held = [
    ...new Set(entries.flatMap(({ seq }) => (seq === null ? [] : [seq]))),
  ].sort((a, b) => a - b);
  let high = held[0];
  if (high === undefined) return null;
  for (const seq of held.slice(1)) {
    if (seq !== high + 1) break;
    high = seq;
  }
  return high;
}

export function lowestSeq(entries: ChatMessageEntry[]): number | null {
  let lowest: number | null = null;
  for (const { seq } of entries) {
    if (seq !== null && (lowest === null || seq < lowest)) lowest = seq;
  }
  return lowest;
}
