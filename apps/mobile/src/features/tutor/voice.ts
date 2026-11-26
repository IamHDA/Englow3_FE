import { fetch } from "expo/fetch";

import { accessToken } from "@/lib/apollo";
import { env } from "@/lib/env";
import type { Recording } from "@/ui/audio";

type Receipt = {
  id: string;
  status: string;
  transcript?: string | null;
  errorCode?: string | null;
};

const POLL_MS = 2000;
const GIVE_UP_MS = 180_000;

async function request(
  path: string,
  init: { method: string; body?: ArrayBuffer },
): Promise<Receipt | null> {
  const token = await accessToken();
  const response = await fetch(`${env.bffUrl}/rest/tutor/recordings${path}`, {
    method: init.method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.body ? { "content-type": "audio/wav" } : {}),
    },
    ...(init.body ? { body: init.body } : {}),
  });
  if (!response.ok)
    throw new Error(`Voice request failed with ${response.status}`);
  return response.status === 204 ? null : ((await response.json()) as Receipt);
}

/**
 * Speech to text for the tutor's composer, through the BFF's REST route (the
 * same one the web uses): upload the WAV under a client key, then poll that
 * key until the transcript is ready. The learner edits the text before it is
 * sent, so a misheard word is never sent on its own.
 */
export async function transcribe(
  recording: Recording,
  clientMessageId: string,
  locale: "en-US" | "vi-VN" = "en-US",
): Promise<string> {
  const bytes = recording.bytes;
  await request(`?${new URLSearchParams({ clientMessageId, locale })}`, {
    method: "POST",
    body: bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  });
  const until = Date.now() + GIVE_UP_MS;
  while (Date.now() < until) {
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    const receipt = await request(
      `/requests/${encodeURIComponent(clientMessageId)}`,
      { method: "GET" },
    );
    if (receipt?.status === "READY") return receipt.transcript ?? "";
    if (receipt && ["FAILED", "DELETED"].includes(receipt.status))
      throw new Error(receipt.errorCode ?? "FAILED");
  }
  throw new Error("TIMEOUT");
}
