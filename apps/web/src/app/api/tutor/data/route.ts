import { bffRestUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
async function handle(request: Request) {
  const refused = refuseCrossSite(request);
  if (refused) return refused;
  const params = new URL(request.url).searchParams;
  const kind = params.get("kind") ?? "",
    page = params.get("page") ?? "0";
  if (
    request.method === "GET" &&
    (![
      "CONVERSATIONS",
      "MESSAGES",
      "VERSIONS",
      "REPORTS",
      "RECORDINGS",
      "MEMORY",
    ].includes(kind) ||
      !/^\d{1,6}$/.test(page) ||
      Number(page) > 100000)
  )
    return Response.json({ code: "BAD_USER_INPUT" }, { status: 400 });
  return forwardToBff(
    `${bffRestUrl}/tutor/data?${new URLSearchParams({ kind, page })}`,
    {
      method: request.method,
      timeoutMs: 35_000,
      unreachable: () =>
        Response.json({ code: "BACKEND_UNAVAILABLE" }, { status: 502 }),
    },
  );
}
export const GET = handle;
export const DELETE = handle;
