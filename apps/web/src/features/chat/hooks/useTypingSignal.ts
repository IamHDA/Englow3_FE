"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TYPING_EXPIRE_MS, TYPING_SEND_INTERVAL_MS } from "../constants/chat";
import { FRAME_TYPE, type ChatFrame } from "../realtime/frames";

type Options = {
  conversationId: string;
  /** The other person; their signals are the only ones shown. Null for a deleted user. */
  partnerId: string | null;
  /** Sends the one frame a client may send. Returns false while the socket is not open. */
  sendTyping: (conversationId: string, active: boolean) => boolean;
  subscribe: (listener: (frame: ChatFrame) => void) => () => void;
};

/**
 * "Is typing", both ways.
 *
 * Sending: while the viewer types, "active" goes out at most every 3 seconds,
 * and "inactive" the moment the box is emptied, left or sent - never more often,
 * since the other side has a timer of its own. Showing: the partner's signal
 * switches "typing..." on and starts a 5 second timer that switches it off again,
 * since a signal that stops - a closed tab, a dropped connection - never says so;
 * a message from the partner switches it off at once.
 */
export function useTypingSignal({
  conversationId,
  partnerId,
  sendTyping,
  subscribe,
}: Options) {
  const [partnerTyping, setPartnerTyping] = useState(false);
  const expiry = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentAt = useRef<number | null>(null);
  const announced = useRef(false);

  const clearExpiry = useCallback(() => {
    if (expiry.current !== null) clearTimeout(expiry.current);
    expiry.current = null;
  }, []);

  /* ---- Showing the partner's ------------------------------------------- */

  useEffect(() => {
    const unsubscribe = subscribe((frame) => {
      switch (frame.type) {
        case FRAME_TYPE.typing:
          if (
            frame.conversationId !== conversationId ||
            frame.userId !== partnerId
          ) {
            return;
          }
          clearExpiry();
          setPartnerTyping(frame.active);
          if (frame.active) {
            expiry.current = setTimeout(() => {
              expiry.current = null;
              setPartnerTyping(false);
            }, TYPING_EXPIRE_MS);
          }
          return;
        case FRAME_TYPE.message:
          if (
            frame.message.conversationId === conversationId &&
            frame.message.senderId === partnerId
          ) {
            clearExpiry();
            setPartnerTyping(false);
          }
          return;
        case FRAME_TYPE.recalled:
        case FRAME_TYPE.read:
          return;
        default: {
          const unreachable: never = frame;
          return unreachable;
        }
      }
    });
    return () => {
      unsubscribe();
      clearExpiry();
    };
  }, [subscribe, conversationId, partnerId, clearExpiry]);

  /* ---- Sending the viewer's -------------------------------------------- */

  /** The viewer stopped: says so, once, if the other side was told they were typing. */
  const stop = useCallback(() => {
    if (!announced.current) return;
    announced.current = false;
    lastSentAt.current = null;
    sendTyping(conversationId, false);
  }, [conversationId, sendTyping]);

  /** Call on every change of the box with whether it now holds text. */
  const onInput = useCallback(
    (hasText: boolean) => {
      if (!hasText) {
        stop();
        return;
      }
      const now = Date.now();
      if (
        lastSentAt.current !== null &&
        now - lastSentAt.current < TYPING_SEND_INTERVAL_MS
      ) {
        return;
      }
      lastSentAt.current = now;
      announced.current = true;
      sendTyping(conversationId, true);
    },
    [conversationId, sendTyping, stop],
  );

  // Leaving the conversation with text in the box counts as stopping.
  useEffect(() => stop, [stop]);

  return { partnerTyping, onInput, stop };
}
