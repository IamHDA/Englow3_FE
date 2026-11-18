"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { UNREAD_POLL_INTERVAL_MS } from "../constants/chat";

type Options = {
  /** Asks the backend again how many conversations hold something unread. */
  refresh: () => unknown;
  /** The page the viewer is on: moving to another asks again. */
  pathname: string;
  intervalMs?: number;
};

const isShowing = () => document.visibilityState === "visible";

/**
 * When the header asks again. Not a socket: outside the chat screens nothing
 * stays connected to the backend, so the count is asked for - when the viewer
 * moves to another page, when they come back to the tab, and once a minute
 * while the tab is showing. A hidden tab asks nothing, and the minute starts
 * again from the moment it is shown.
 *
 * The first ask, when the header appears, is the query's own.
 */
export function useUnreadPolling({
  refresh,
  pathname,
  intervalMs = UNREAD_POLL_INTERVAL_MS,
}: Options) {
  const ask = useEffectEvent(() => {
    void refresh();
  });

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (timer !== null) clearInterval(timer);
      timer = null;
    };
    const start = () => {
      stop();
      timer = setInterval(() => ask(), intervalMs);
    };
    const onVisibilityChange = () => {
      if (!isShowing()) {
        stop();
        return;
      }
      ask();
      start();
    };

    if (isShowing()) start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [intervalMs]);

  // Compared with the last page asked about rather than skipping "the first
  // run", which a development double-mount would turn into a stray ask.
  const askedFor = useRef(pathname);
  useEffect(() => {
    if (askedFor.current === pathname) return;
    askedFor.current = pathname;
    if (isShowing()) ask();
  }, [pathname]);
}
