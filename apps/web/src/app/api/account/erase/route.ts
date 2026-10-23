import { z } from "zod";

import {
  createSupabaseServerClient,
  rememberSessionPreference,
} from "@/lib/supabase/server";
import { bffRestUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";
import {
  clientKey,
  createRateLimiter,
  tooManyRequests,
} from "@/server/rateLimit";

export const dynamic = "force-dynamic";

/** Erasing is done once; a handful of tries a minute covers a mistyped email and stops a script. */
const allow = createRateLimiter({ windowMs: 60_000, max: 5 });

const Body = z.object({ confirmEmail: z.string().trim().min(1).max(254) });

/**
 * Removes the signed-in learner's account, then signs this browser out.
 *
 * The backend deletes the sign-in itself, so the session cookie that is left
 * names someone who no longer exists; clearing it here is what stops the next
 * page load from treating this browser as a user.
 */
export async function POST(request: Request) {
  const refused = refuseCrossSite(request);
  if (refused) return refused;
  if (!allow(clientKey(request))) return tooManyRequests();

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ code: "BAD_USER_INPUT" }, { status: 400 });
  }

  const answer = await forwardToBff(`${bffRestUrl}/account/erase`, {
    method: "POST",
    contentType: "application/json",
    body: JSON.stringify({ confirmEmail: parsed.data.confirmEmail }),
    timeoutMs: 40_000,
    unreachable: () =>
      Response.json({ code: "BACKEND_UNAVAILABLE" }, { status: 502 }),
  });

  if (answer.status === 204) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    await rememberSessionPreference(false);
  }
  return answer;
}
