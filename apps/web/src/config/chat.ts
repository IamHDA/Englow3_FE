/** The path of the chat socket on the backend, after `NEXT_PUBLIC_CHAT_WS_URL`. */
const CHAT_SOCKET_PATH = "/ws/chat";

/**
 * Where the browser opens the chat socket: straight to the backend, since the
 * Next.js proxy and the BFF run as serverless functions that cannot hold one.
 * `NEXT_PUBLIC_CHAT_WS_URL` is the backend's `ws://` or `wss://` address; it is
 * an address, not a secret. Null when it is not set - the chat then works over
 * REST alone, and says so.
 */
export function chatSocketUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_CHAT_WS_URL?.trim().replace(/\/+$/, "");
  return base ? `${base}${CHAT_SOCKET_PATH}` : null;
}
