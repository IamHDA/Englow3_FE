"use client";

import { useEffect, useRef } from "react";

import { REFRESH_DEBOUNCE_MS } from "../constants/chat";
import { FRAME_TYPE, type ChatFrame } from "../realtime/frames";

type Options = {
  subscribe: (listener: (frame: ChatFrame) => void) => () => void;
  /** Goes up by one every time the socket (re)opens. */
  connectionCount: number;
  /** Fetches the conversation list and the unread count again. */
  refresh: () => unknown;
};

/**
 * Keeps the conversation list and the header's unread count true while the
 * chat is open. The server decides what the list says - the order, the
 * previews, how much is unread - so a frame does not edit the list; it asks for
 * it again, once, a second after the last frame of a burst. (Patching the
 * Apollo cache from frames would need the other person's name and picture for a
 * conversation the list has not seen, and would drift from the unread counts the
 * backend keeps.) After the socket (re)opens it asks at once: that is the
 * catch-up for everything missed while it was down.
 */
export function useChatListRefresh({
  subscribe,
  connectionCount,
  refresh,
}: Options) {
  // The effects outlive renders; they must call the latest refresh.
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = subscribe((frame) => {
      switch (frame.type) {
        case FRAME_TYPE.message:
        case FRAME_TYPE.recalled:
        case FRAME_TYPE.read:
          if (timer !== null) clearTimeout(timer);
          timer = setTimeout(() => {
            timer = null;
            void refreshRef.current();
          }, REFRESH_DEBOUNCE_MS);
          return;
        case FRAME_TYPE.typing:
          return;
        default: {
          const unreachable: never = frame;
          return unreachable;
        }
      }
    });
    return () => {
      unsubscribe();
      if (timer !== null) clearTimeout(timer);
    };
  }, [subscribe]);

  useEffect(() => {
    if (connectionCount > 0) void refreshRef.current();
  }, [connectionCount]);
}
