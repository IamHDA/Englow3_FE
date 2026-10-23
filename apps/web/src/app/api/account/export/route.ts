import { bffRestUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** A copy of everything held about the signed-in learner. */
export async function GET(request: Request) {
  const refused = refuseCrossSite(request);
  if (refused) return refused;
  return forwardToBff(`${bffRestUrl}/account/export`, {
    method: "GET",
    timeoutMs: 58_000,
    unreachable: () =>
      Response.json({ code: "BACKEND_UNAVAILABLE" }, { status: 502 }),
  });
}
