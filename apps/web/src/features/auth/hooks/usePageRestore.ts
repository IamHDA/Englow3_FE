"use client";

import { useEffect } from "react";

/**
 * Runs when the browser restores this page from the back/forward cache.
 *
 * Leaving for an OAuth provider and pressing Back remounts nothing: the page
 * comes back out of the bfcache with its React state intact, so any
 * "in progress" flag set just before the redirect is still set. `pageshow`
 * with `persisted` is the only signal that separates a restore from a fresh
 * load, which is why neither mount nor `visibilitychange` can stand in for it.
 *
 * Pass a stable callback - `useCallback` or a setter - or the listener is torn
 * down and re-added on every render.
 */
export function usePageRestore(onRestore: () => void) {
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        onRestore();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [onRestore]);
}
