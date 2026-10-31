import { bffRestUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const refused = refuseCrossSite(request);
  if (refused) return refused;
  const params = new URL(request.url).searchParams;
  const id = params.get("conversationId") ?? "",
    messageId = params.get("messageId") ?? "";
  const cursor = params.get("cursor") ?? "";
  if (!UUID.test(id) || !UUID.test(messageId) || cursor.length > 100)
    return Response.json({ code: "BAD_USER_INPUT" }, { status: 400 });
  return forwardToBff(
    `${bffRestUrl}/tutor/conversations/${id}/messages/${messageId}/events?${new URLSearchParams({ cursor })}`,
    {
      method: "GET",
      timeoutMs: 55_000,
      signal: request.signal,
      unreachable: () =>
        Response.json({ code: "BACKEND_UNAVAILABLE" }, { status: 502 }),
    },
  );
}
