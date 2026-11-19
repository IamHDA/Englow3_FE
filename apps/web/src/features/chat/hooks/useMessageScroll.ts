"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

import { isOwnMessage, type ChatMessageEntry } from "../realtime/messageList";

/** Within this many pixels of the bottom counts as "at the bottom": a new message then keeps it there. */
const BOTTOM_THRESHOLD_PX = 80;

/** Scrolled this close to the top, the next older page is asked for. */
const TOP_THRESHOLD_PX = 120;

type Options = {
  entries: ChatMessageEntry[];
  hasOlder: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
};

type Snapshot = {
  firstKey: string | null;
  lastKey: string | null;
  height: number;
  top: number;
};

/**
 * Where the message list is scrolled to, as the messages change.
 *
 * - The conversation opens at the newest message.
 * - A new message keeps the list at the bottom if it was there, and a message
 *   the viewer just sent always does; someone reading older messages is not
 *   pulled away by a new one.
 * - Older messages added at the top (after scrolling up for them) do not move
 *   what the viewer is looking at: the scroll position is kept relative to the
 *   message that was at the top.
 * - Scrolling near the top asks for the next older page.
 * - A picture that finishes loading while the list is at the bottom keeps it there.
 */
export function useMessageScroll({
  entries,
  hasOlder,
  loadingOlder,
  onLoadOlder,
}: Options) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const snapshot = useRef<Snapshot | null>(null);

  const remember = useCallback(
    (element: HTMLDivElement, keys: Pick<Snapshot, "firstKey" | "lastKey">) => {
      snapshot.current = {
        ...keys,
        height: element.scrollHeight,
        top: element.scrollTop,
      };
    },
    [],
  );

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const firstKey = entries[0]?.key ?? null;
    const lastKey = entries.at(-1)?.key ?? null;
    const before = snapshot.current;

    if (before === null || before.lastKey === null) {
      element.scrollTop = element.scrollHeight;
    } else if (firstKey !== before.firstKey && lastKey === before.lastKey) {
      element.scrollTop = element.scrollHeight - before.height + before.top;
    } else if (
      lastKey !== before.lastKey &&
      // The viewer's own new message always scrolls into view.
      (atBottom.current || isOwnMessage(entries.at(-1)!))
    ) {
      element.scrollTop = element.scrollHeight;
      atBottom.current = true;
    }
    remember(element, { firstKey, lastKey });
  }, [entries, remember]);

  const onScrollPositionChange = useCallback(() => {
    const element = viewportRef.current;
    if (!element) return;
    atBottom.current =
      element.scrollHeight - element.scrollTop - element.clientHeight <=
      BOTTOM_THRESHOLD_PX;
    if (snapshot.current) {
      snapshot.current.top = element.scrollTop;
      snapshot.current.height = element.scrollHeight;
    }
    if (element.scrollTop <= TOP_THRESHOLD_PX && hasOlder && !loadingOlder) {
      onLoadOlder();
    }
  }, [hasOlder, loadingOlder, onLoadOlder]);

  /** For content that grows after it was drawn: a picture, once it has loaded. */
  const keepAtBottom = useCallback(() => {
    const element = viewportRef.current;
    if (element && atBottom.current) element.scrollTop = element.scrollHeight;
  }, []);

  return { viewportRef, onScrollPositionChange, keepAtBottom };
}
