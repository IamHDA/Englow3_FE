"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { backendCodeOf } from "@/shared/network/loadError";

import {
  BACKEND_CODES,
  CATCH_UP_PAGE_SIZE,
  CONVERSATION_LOCKING_CODES,
  MAX_CATCH_UP_PAGES,
  MESSAGE_PAGE_SIZE,
  NON_RETRYABLE_SEND_CODES,
} from "../constants/chat";
import { FRAME_TYPE, type ChatFrame } from "../realtime/frames";
import {
  applyRecall,
  entryFromMessage,
  highestSeq,
  lowestSeq,
  markFailed,
  markSending,
  mergeEntries,
  optimisticEntry,
  removeEntry,
  type ChatMessageEntry,
} from "../realtime/messageList";
import type { ChatMessageData } from "../types";

/** What the hook needs from the outside: the backend calls, injected so the hook can be driven without a transport. */
export type ChatMessagesApi = {
  fetchMessages: (variables: {
    conversationId: string;
    afterSeq?: number | null;
    beforeSeq?: number | null;
    limit: number;
  }) => Promise<ChatMessageData[]>;
  sendMessage: (variables: {
    conversationId: string;
    clientId: string;
    body: string | null;
    imageUploadId: string | null;
  }) => Promise<ChatMessageData>;
  recallMessage: (messageId: string) => Promise<ChatMessageData>;
  /** Puts the file in object storage and resolves to the upload id the message names. Rejects when the upload did not finish. */
  uploadImage: (conversationId: string, file: File) => Promise<string>;
};

type Options = {
  conversationId: string;
  /** The other person, whose read marks are the ones that matter. Null for a deleted user. */
  partnerId: string | null;
  /** The newest page, from the view's query; undefined while that loads. */
  seed: ChatMessageData[] | undefined;
  subscribe: (listener: (frame: ChatFrame) => void) => () => void;
  /** Goes up by one every time the socket (re)opens: the cue to catch up. */
  connectionCount: number;
  api: ChatMessagesApi;
  /** A send was refused because the two can no longer talk: the view refreshes the conversation and locks the box. */
  onSendRefused?: (code: string) => void;
  newClientId?: () => string;
  createPreviewUrl?: (file: File) => string;
  revokePreviewUrl?: (url: string) => void;
};

/** What an unconfirmed message needs to be sent, and sent again. Kept out of render state: it holds a File. */
type Outgoing = {
  body: string | null;
  image: File | null;
  imageUploadId: string | null;
  previewUrl: string | null;
};

type State = {
  /** Everything but the seed: frames, older pages, catch-ups, and the viewer's unconfirmed messages. */
  live: ChatMessageEntry[];
  /** Recalls seen, applied over the seed too: a page fetched before a recall must not undo it. */
  recalledIds: ReadonlySet<string>;
  partnerReadSeq: number | null;
  olderExhausted: boolean;
};

type Action =
  | { type: "incoming"; messages: ChatMessageData[] }
  | { type: "older"; messages: ChatMessageData[]; exhausted: boolean }
  | { type: "queued"; entry: ChatMessageEntry }
  | {
      type: "failed";
      clientId: string;
      code: string | null;
      retryable: boolean;
    }
  | { type: "retrying"; clientId: string }
  | { type: "dismissed"; key: string }
  | { type: "recalled"; messageId: string }
  | { type: "partnerRead"; upToSeq: number };

const INITIAL_STATE: State = {
  live: [],
  recalledIds: new Set(),
  partnerReadSeq: null,
  olderExhausted: false,
};

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "incoming":
      return {
        ...state,
        live: mergeEntries(state.live, action.messages.map(entryFromMessage)),
      };
    case "older":
      return {
        ...state,
        live: mergeEntries(state.live, action.messages.map(entryFromMessage)),
        olderExhausted: action.exhausted,
      };
    case "queued":
      return { ...state, live: mergeEntries(state.live, [action.entry]) };
    case "failed":
      return {
        ...state,
        live: markFailed(state.live, action.clientId, {
          code: action.code,
          retryable: action.retryable,
        }),
      };
    case "retrying":
      return { ...state, live: markSending(state.live, action.clientId) };
    case "dismissed":
      return { ...state, live: removeEntry(state.live, action.key) };
    case "recalled":
      return {
        ...state,
        live: applyRecall(state.live, action.messageId),
        recalledIds: new Set(state.recalledIds).add(action.messageId),
      };
    case "partnerRead":
      return {
        ...state,
        partnerReadSeq: Math.max(state.partnerReadSeq ?? 0, action.upToSeq),
      };
    default: {
      const unreachable: never = action;
      return unreachable;
    }
  }
}

// Defaults at module level: a default written in the parameter list is a new
// function on every render, and a callback or effect that depends on it would
// then run again on every render - which, for the cleanup that releases a
// preview, released it while the message was still on its way.
const randomClientId = () => crypto.randomUUID();
const objectUrlFor = (file: File) => URL.createObjectURL(file);
const releaseObjectUrl = (url: string) => URL.revokeObjectURL(url);

/**
 * The messages of one conversation, live.
 *
 * What it keeps in one list: the newest page the view fetched (the seed), what
 * the socket pushes, older pages scrolled back to, the catch-up after a
 * reconnect, and what the viewer has just written and awaits an answer for.
 * Every route in is a merge by message id (an own message also by its
 * clientId), so a message that arrives twice - by frame, by catch-up, by the
 * answer to its send - is in the list once; and a frame that comes before the
 * seed does is simply held in the live part until the two are merged.
 *
 * Sending is optimistic: the message is in the list at once with a fresh
 * clientId, and sends go out one after another so the backend numbers them in
 * the order they were written. A failure keeps the message, marked, with the
 * same clientId for the next try - so a retry of a message the backend did
 * receive returns that message instead of sending a second.
 */
export function useConversationMessages({
  conversationId,
  partnerId,
  seed,
  subscribe,
  connectionCount,
  api,
  onSendRefused,
  newClientId = randomClientId,
  createPreviewUrl = objectUrlFor,
  revokePreviewUrl = releaseObjectUrl,
}: Options) {
  const [state, dispatch] = useReducer(reduce, INITIAL_STATE);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const loadingOlderRef = useRef(false);
  const outgoing = useRef(new Map<string, Outgoing>());
  /** Sends run one at a time; this is the end of the line. */
  const queue = useRef<Promise<void>>(Promise.resolve());
  /** The url an image was last re-fetched for, so a link that stays broken is not fetched again in a loop. */
  const refreshedFor = useRef(new Map<string, string>());

  const entries = useMemo(() => {
    let merged = mergeEntries((seed ?? []).map(entryFromMessage), state.live);
    for (const messageId of state.recalledIds) {
      merged = applyRecall(merged, messageId);
    }
    return merged;
  }, [seed, state.live, state.recalledIds]);

  const hasOlder =
    !state.olderExhausted && (seed?.length ?? 0) >= MESSAGE_PAGE_SIZE;

  /* ---- The socket's frames ---------------------------------------------- */

  useEffect(
    () =>
      subscribe((frame) => {
        switch (frame.type) {
          case FRAME_TYPE.message:
            if (frame.message.conversationId === conversationId) {
              dispatch({ type: "incoming", messages: [frame.message] });
            }
            return;
          case FRAME_TYPE.recalled:
            if (frame.conversationId === conversationId) {
              dispatch({ type: "recalled", messageId: frame.messageId });
            }
            return;
          case FRAME_TYPE.read:
            // The viewer's own read mark, from another tab, is the list's
            // business; this is how far the other person has read.
            if (
              frame.conversationId === conversationId &&
              frame.userId === partnerId
            ) {
              dispatch({ type: "partnerRead", upToSeq: frame.upToSeq });
            }
            return;
          case FRAME_TYPE.typing:
            return;
          default: {
            const unreachable: never = frame;
            return unreachable;
          }
        }
      }),
    [subscribe, conversationId, partnerId],
  );

  /* ---- Catching up after the socket (re)opens --------------------------- */

  const seeded = seed !== undefined;
  const caughtUpFor = useRef(0);

  const catchUp = useEffectEvent(async () => {
    let after = highestSeq(entries);
    for (let page = 0; page < MAX_CATCH_UP_PAGES; page += 1) {
      const batch = await api.fetchMessages({
        conversationId,
        afterSeq: after,
        limit: CATCH_UP_PAGE_SIZE,
      });
      dispatch({ type: "incoming", messages: batch });
      // Without a seq to count from the answer is the newest page: all there is.
      if (after === null || batch.length < CATCH_UP_PAGE_SIZE) return;
      after = batch[batch.length - 1].seq;
    }
  });

  useEffect(() => {
    // Wait for the seed: until then there is no seq to count from, and the seed
    // is itself fetched after the socket opened or catches up as it arrives.
    if (connectionCount === 0 || !seeded) return;
    if (caughtUpFor.current === connectionCount) return;
    caughtUpFor.current = connectionCount;
    // A catch-up that fails is not shown: the next reconnect, or a reload, repeats it.
    catchUp().catch(() => undefined);
  }, [connectionCount, seeded]);

  /* ---- Scrolling back --------------------------------------------------- */

  const loadOlder = useCallback(async () => {
    const before = lowestSeq(entries);
    if (loadingOlderRef.current || !hasOlder || before === null) return;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    try {
      const page = await api.fetchMessages({
        conversationId,
        beforeSeq: before,
        limit: MESSAGE_PAGE_SIZE,
      });
      dispatch({
        type: "older",
        messages: page,
        exhausted: page.length < MESSAGE_PAGE_SIZE,
      });
    } catch {
      // Still older to load: scrolling to the top again asks again.
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [api, conversationId, entries, hasOlder]);

  /* ---- Sending ---------------------------------------------------------- */

  const forget = useCallback(
    (clientId: string) => {
      const sent = outgoing.current.get(clientId);
      if (sent?.previewUrl) revokePreviewUrl(sent.previewUrl);
      outgoing.current.delete(clientId);
    },
    [revokePreviewUrl],
  );

  const deliver = useCallback(
    async (clientId: string) => {
      const pending = outgoing.current.get(clientId);
      if (!pending) return;
      try {
        // The image goes up first, once: a retry after the backend refused the
        // message reuses the upload.
        if (pending.image && !pending.imageUploadId) {
          pending.imageUploadId = await api.uploadImage(
            conversationId,
            pending.image,
          );
        }
        const message = await api.sendMessage({
          conversationId,
          clientId,
          body: pending.body,
          imageUploadId: pending.imageUploadId,
        });
        dispatch({ type: "incoming", messages: [message] });
        forget(clientId);
      } catch (error) {
        const code = backendCodeOf(error);
        dispatch({
          type: "failed",
          clientId,
          code,
          retryable: !(code && NON_RETRYABLE_SEND_CODES.has(code)),
        });
        if (code && CONVERSATION_LOCKING_CODES.has(code)) onSendRefused?.(code);
      }
    },
    [api, conversationId, forget, onSendRefused],
  );

  const enqueue = useCallback(
    (clientId: string) => {
      queue.current = queue.current.then(() => deliver(clientId));
    },
    [deliver],
  );

  const send = useCallback(
    ({ body, image }: { body: string; image: File | null }) => {
      const text = body.trim() || null;
      if (!text && !image) return;
      const clientId = newClientId();
      const previewUrl = image ? createPreviewUrl(image) : null;
      outgoing.current.set(clientId, {
        body: text,
        image,
        imageUploadId: null,
        previewUrl,
      });
      dispatch({
        type: "queued",
        entry: optimisticEntry({
          clientId,
          body: text,
          imageUrl: previewUrl,
          sentAt: new Date().toISOString(),
        }),
      });
      enqueue(clientId);
    },
    [createPreviewUrl, enqueue, newClientId],
  );

  /** Sends a failed message again, under the same clientId. */
  const retry = useCallback(
    (key: string) => {
      const entry = entries.find((candidate) => candidate.key === key);
      if (!entry?.clientId || entry.id !== null) return;
      if (!outgoing.current.has(entry.clientId)) return;
      dispatch({ type: "retrying", clientId: entry.clientId });
      enqueue(entry.clientId);
    },
    [enqueue, entries],
  );

  /** Gives up on a message that was not delivered. */
  const dismiss = useCallback(
    (key: string) => {
      const entry = entries.find((candidate) => candidate.key === key);
      if (entry?.clientId) forget(entry.clientId);
      dispatch({ type: "dismissed", key });
    },
    [entries, forget],
  );

  // Previews still held when the conversation is left are given back. Through a
  // ref, so that a caller's new `revokePreviewUrl` does not run this cleanup
  // before the conversation is actually left.
  const revokeRef = useRef(revokePreviewUrl);
  useEffect(() => {
    revokeRef.current = revokePreviewUrl;
  }, [revokePreviewUrl]);
  useEffect(() => {
    const pending = outgoing.current;
    return () => {
      for (const sent of pending.values()) {
        if (sent.previewUrl) revokeRef.current(sent.previewUrl);
      }
    };
  }, []);

  /* ---- Recalling and refreshing ----------------------------------------- */

  /** Takes a message back. Recalling one that was already recalled is the result wanted, so it counts as done. */
  const recall = useCallback(
    async (messageId: string) => {
      try {
        await api.recallMessage(messageId);
      } catch (error) {
        if (backendCodeOf(error) !== BACKEND_CODES.alreadyRecalled) throw error;
      }
      dispatch({ type: "recalled", messageId });
    },
    [api],
  );

  /**
   * An image link expires after an hour, and a picture that fails to load is
   * most often that. Fetches the message again for a new link - once per
   * link: a link that fails again is broken, not stale.
   */
  const refreshImage = useCallback(
    async (entry: ChatMessageEntry) => {
      if (entry.id === null || entry.seq === null || !entry.imageUrl) return;
      if (refreshedFor.current.get(entry.id) === entry.imageUrl) return;
      refreshedFor.current.set(entry.id, entry.imageUrl);
      try {
        // The one message with this seq: the newest one before seq + 1.
        const [fresh] = await api.fetchMessages({
          conversationId,
          beforeSeq: entry.seq + 1,
          limit: 1,
        });
        if (fresh?.id === entry.id) {
          dispatch({ type: "incoming", messages: [fresh] });
        }
      } catch {
        // The picture stays as it is; nothing was lost by trying.
      }
    },
    [api, conversationId],
  );

  return {
    entries,
    hasOlder,
    loadingOlder,
    loadOlder,
    send,
    retry,
    dismiss,
    recall,
    refreshImage,
    /** How far the other person has read, as far as this session has been told. Not kept by the backend for a reload. */
    partnerReadSeq: state.partnerReadSeq,
  };
}
