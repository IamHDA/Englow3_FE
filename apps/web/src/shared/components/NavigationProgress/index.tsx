"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import classes from "./NavigationProgress.module.css";

const cancelListeners = new Set<() => void>();

/**
 * For a click handler that stops a link from navigating - a guard that opens
 * the login form instead. The bar started on the click already; this takes it
 * down again. Next's own Link prevents the default too, on every click, so the
 * event cannot tell the two apart by itself.
 */
export function cancelNavigationProgress() {
  for (const cancel of cancelListeners) cancel();
}

/**
 * A thin bar across the top of the page from the moment a link is clicked
 * until the new page is on screen.
 *
 * The App Router has no navigation events, so this starts on the click itself
 * - any same-origin link that leads somewhere else - and finishes when the
 * pathname or query changes. Between the two the bar creeps towards 90%: it
 * cannot know how far along the server is, only that something is happening,
 * which is the point. Without it a click on a slow page looked ignored.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState<number | null>(null);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const giveUp = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopTrickle() {
    if (trickle.current) clearInterval(trickle.current);
    if (giveUp.current) clearTimeout(giveUp.current);
    trickle.current = null;
    giveUp.current = null;
  }

  // Start on a click that will navigate.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      const here = new URL(window.location.href);
      const sameDocument =
        url.pathname === here.pathname && url.search === here.search;
      if (url.origin !== here.origin || sameDocument) return;

      stopTrickle();
      setProgress(8);
      trickle.current = setInterval(() => {
        // Each step covers a share of what is left, so it slows but never
        // reaches the end on its own.
        setProgress((current) =>
          current === null ? null : current + (90 - current) * 0.08,
        );
      }, 200);
      // A navigation that lands back on the same URL - a redirect home from
      // home - never changes the pathname. Do not leave the bar up for it.
      giveUp.current = setTimeout(() => {
        stopTrickle();
        setProgress(null);
      }, 20000);
    }

    function cancel() {
      stopTrickle();
      setProgress(null);
    }

    // Capture phase: before any React handler, since Next's Link marks every
    // click defaultPrevented on its way to navigating client-side. A handler
    // that genuinely stops the navigation calls cancelNavigationProgress().
    document.addEventListener("click", onClick, true);
    cancelListeners.add(cancel);
    return () => {
      document.removeEventListener("click", onClick, true);
      cancelListeners.delete(cancel);
    };
  }, []);

  // Finish when the new page has arrived.
  useEffect(() => {
    stopTrickle();
    // Jump to full, then fade out. Both from timers: the effect only
    // schedules, it does not set state while rendering settles.
    const finish = setTimeout(
      () => setProgress((current) => (current === null ? null : 100)),
      0,
    );
    const hide = setTimeout(() => setProgress(null), 350);
    return () => {
      clearTimeout(finish);
      clearTimeout(hide);
    };
  }, [pathname, searchParams]);

  useEffect(() => stopTrickle, []);

  if (progress === null) return null;

  return (
    <div className={classes.track} aria-hidden="true">
      <div
        className={classes.bar}
        style={{
          transform: `scaleX(${progress / 100})`,
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
