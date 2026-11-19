"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** Leaves a page with something unsaved on it only when the person says so. */
export type UnsavedChangesGuard = {
  /** Whether a way out was held back and the person is being asked. */
  asking: boolean;
  /** The person chose to leave: go where the click was going. */
  leave: () => void;
  /** The person chose to stay and keep writing. */
  stay: () => void;
  /**
   * For a way out that is not a link - a Cancel button: runs `go` at once when
   * nothing is unsaved, and otherwise asks first and runs it only if the person
   * chooses to leave.
   */
  confirmBefore: (go: () => void) => void;
};

/**
 * Stops a long post being lost to a stray click while the form holds changes
 * that are not saved (`dirty`):
 *
 * - closing the tab, reloading, or typing another address: the browser's own
 *   "leave this page?" (`beforeunload`), which no page can word;
 * - a click on a link to another page of this site - the header, a logo, an
 *   author's name: the click is held back and `asking` says so, for the page to
 *   ask in its own words and in the person's language;
 * - a way out that is not a link, such as a Cancel button, through
 *   `confirmBefore`.
 *
 * Next.js's App Router has no hook that sees a route change before it happens,
 * which is why links are caught by their click. What this cannot see is the
 * browser's own Back button inside the app; `beforeunload` does not fire for
 * that either. Programmatic navigation by the page itself (after a save) is not
 * a click and goes through.
 *
 * Nothing is held once `dirty` is false.
 */
export function useUnsavedChangesGuard(dirty: boolean): UnsavedChangesGuard {
  const router = useRouter();
  // What to do if the person chooses to leave, for the way out that was held back.
  const [held, setHeld] = useState<{ go: () => void } | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Some browsers show their prompt only when this is set.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onClick = (event: MouseEvent) => {
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
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      // A new tab or a download leaves this page where it is.
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const to = new URL(anchor.href, window.location.href);
      // Another site is `beforeunload`'s to ask about; the same page is no move.
      if (to.origin !== window.location.origin) return;
      if (
        to.pathname === window.location.pathname &&
        to.search === window.location.search
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const path = `${to.pathname}${to.search}${to.hash}`;
      setHeld({ go: () => router.push(path) });
    };
    // The capture phase, so it runs before the router's own handler on the link.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, router]);

  const leave = useCallback(() => {
    if (held === null) return;
    const { go } = held;
    setHeld(null);
    go();
  }, [held]);

  const stay = useCallback(() => setHeld(null), []);

  const confirmBefore = useCallback(
    (go: () => void) => {
      if (dirty) setHeld({ go });
      else go();
    },
    [dirty],
  );

  return { asking: held !== null, leave, stay, confirmBefore };
}
