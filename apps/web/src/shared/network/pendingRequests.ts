/**
 * How many requests to the BFF are in flight right now, for anything that
 * wants to react to a slow backend without each screen tracking it.
 *
 * A module-level store read through useSyncExternalStore: the Apollo link
 * reports every operation's start and end here, and components subscribe.
 * Counted in the browser only - on the server the same module is shared by
 * every request, and nothing there reads it.
 */

type Listener = () => void;

let pending = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function beginRequest() {
  if (typeof window === "undefined") return;
  pending += 1;
  emit();
}

export function endRequest() {
  if (typeof window === "undefined") return;
  pending = Math.max(0, pending - 1);
  emit();
}

export function subscribePendingRequests(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function pendingRequestCount() {
  return pending;
}

/** The server never has requests of its own in flight to show. */
export function serverPendingRequestCount() {
  return 0;
}
