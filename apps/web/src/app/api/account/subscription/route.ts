import { bffRestUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";

export const dynamic = "force-dynamic";

/** The signed-in learner's plan and today's AI allowance. */
export async function GET(request: Request) {
  const refused = refuseCrossSite(request);
  if (refused) return refused;
  return forwardToBff(`${bffRestUrl}/account/subscription`, {
    method: "GET",
    timeoutMs: 20_000,
    unreachable: () =>
      Response.json({ code: "BACKEND_UNAVAILABLE" }, { status: 502 }),
  });
}
