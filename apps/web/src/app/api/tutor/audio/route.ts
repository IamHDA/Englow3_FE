import { bffRestUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BYTES = 2_100_000;

async function handle(request: Request) {
  const refused = refuseCrossSite(request);
  if (refused) return refused;
  const params = new URL(request.url).searchParams;
  const id =
    params.get(
      request.method === "DELETE" ? "recordingId" : "clientMessageId",
    ) ?? "";
  if (!UUID.test(id))
    return Response.json({ code: "BAD_USER_INPUT" }, { status: 400 });
  let body: Uint8Array | undefined;
  const locale = params.get("locale") ?? "en-US";
  if (request.method === "POST") {
    if (
      !["en-US", "vi-VN"].includes(locale) ||
      request.headers.get("content-type") !== "audio/wav"
    )
      return Response.json({ code: "BAD_USER_INPUT" }, { status: 400 });
    if (Number(request.headers.get("content-length")) > MAX_BYTES)
      return Response.json({ code: "TUTOR_AUDIO_TOO_LARGE" }, { status: 413 });
    const reader = request.body?.getReader();
    if (!reader)
      return Response.json({ code: "BAD_USER_INPUT" }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX_BYTES) {
          await reader.cancel();
          return Response.json(
            { code: "TUTOR_AUDIO_TOO_LARGE" },
            { status: 413 },
          );
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    body = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
  }
  const suffix =
    request.method === "POST"
      ? `?${new URLSearchParams({ clientMessageId: id, locale })}`
      : request.method === "GET"
        ? `/requests/${id}`
        : `/${id}`;
  return forwardToBff(`${bffRestUrl}/tutor/recordings${suffix}`, {
    method: request.method,
    body: body as BodyInit | undefined,
    contentType: "audio/wav",
    timeoutMs: 50_000,
    // Do not abandon an accepted upload when the browser closes. Receipt recovers the same UUID.
    unreachable: () =>
      Response.json({ code: "BACKEND_UNAVAILABLE" }, { status: 502 }),
  });
}
export const POST = handle;
export const GET = handle;
export const DELETE = handle;
