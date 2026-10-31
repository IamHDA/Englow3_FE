const CHANNEL = "englow-auth";

/**
 * Tells the other tabs of this browser that someone signed in or out here.
 *
 * The session is in a cookie the page cannot read, so a tab has no event to
 * learn from when another tab changes it - it would keep showing the old
 * account until its next navigation. A tab that hears this re-reads the
 * session from the server instead.
 */
export function announceSessionChange() {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage("changed");
  channel.close();
}

/** Calls `listener` when another tab announces a change; returns the way to stop. */
export function onSessionChangeElsewhere(listener: () => void): () => void {
  if (typeof BroadcastChannel === "undefined") return () => {};
  const channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = listener;
  return () => channel.close();
}
