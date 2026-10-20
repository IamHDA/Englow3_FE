import type { TutorMessage } from "../types";

export type TutorEvent = {
  type: "ping" | "reset" | "delta" | "done" | "gone";
  id?: string | null;
  delta?: string | null;
  message?: TutorMessage | null;
};

/** Handles arbitrary UTF-8/network chunk boundaries; a cursor contains no credential or learner content. */
export async function readTutorStream(
  conversationId: string,
  messageId: string,
  cursor: string,
  signal: AbortSignal,
  receive: (event: TutorEvent) => void,
) {
  const response = await fetch(
    `/api/tutor/stream?${new URLSearchParams({ conversationId, messageId, cursor })}`,
    { signal, credentials: "same-origin", cache: "no-store" },
  );
  if (
    !response.ok ||
    !response.body ||
    !response.headers.get("content-type")?.includes("text/event-stream")
  )
    throw new Error("Stream unavailable");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer = (buffer + decoder.decode(value, { stream: true })).replace(
        /\r\n/g,
        "\n",
      );
      if (buffer.length > 1_000_000) throw new Error("Stream frame too large");
      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) >= 0) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = frame
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (!data) continue;
        const event = JSON.parse(data) as TutorEvent;
        if (!["ping", "reset", "delta", "done", "gone"].includes(event.type))
          throw new Error("Unknown stream event");
        receive(event);
        if (event.type === "done" || event.type === "gone")
          return event.type === "done";
      }
    }
    return false;
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
