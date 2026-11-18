"use client";

import { useDocumentVisibility } from "@mantine/hooks";
import { useEffect, useEffectEvent, useRef } from "react";

import { MARK_READ_DEBOUNCE_MS } from "../constants/chat";

type Options = {
  /** The highest seq of a message from the other person that is on screen; null when there is none. */
  upToSeq: number | null;
  /** How far the viewer had read when the conversation was fetched. */
  readSeq: number;
  /** The `markChatRead` mutation. */
  markRead: (upToSeq: number) => Promise<unknown>;
  /** The mark went through: the unread counts elsewhere are out of date. */
  onMarked?: () => void;
};

/**
 * Tells the backend the viewer has read an open conversation - when there is
 * something new from the other person to have read, the window is showing, and
 * a second has passed since the last new message (a burst makes one call). A
 * hidden tab marks nothing: the message has not been seen. Asking again for a
 * seq already asked for would only cost a request, so it does not.
 */
export function useMarkRead({ upToSeq, readSeq, markRead, onMarked }: Options) {
  const visibility = useDocumentVisibility();
  /** The highest seq asked for so far. */
  const asked = useRef(0);

  const mark = useEffectEvent((seq: number) => {
    const before = asked.current;
    asked.current = seq;
    markRead(seq).then(
      () => onMarked?.(),
      () => {
        // Not marked: the next new message, or coming back to the tab, tries again.
        if (asked.current === seq) asked.current = before;
      },
    );
  });

  useEffect(() => {
    if (visibility !== "visible" || upToSeq === null) return;
    if (upToSeq <= Math.max(readSeq, asked.current)) return;
    const timer = setTimeout(() => mark(upToSeq), MARK_READ_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [visibility, upToSeq, readSeq]);
}
