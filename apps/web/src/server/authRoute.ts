import "server-only";

import type { ZodType } from "zod";

import { refuseCrossSite } from "@/server/csrf";
import {
  clientKey,
  createRateLimiter,
  tooManyRequests,
} from "@/server/rateLimit";

/**
 * Sign-in and the other account calls are the ones worth guessing at, so they
 * get a tighter ceiling than ordinary traffic. Supabase rate-limits on its own
 * side too; this only keeps a script from using this server as the megaphone.
 */
const allow = createRateLimiter({ windowMs: 60_000, max: 20 });

export type AuthApiError = { code?: string; status?: number; name?: string };

type Parsed<T> = { ok: true; value: T } | { ok: false; response: Response };

/**
 * Everything an auth route does before touching Supabase: refuse a request
 * another site could have caused, slow down a flood, and read the body.
 */
export async function readAuthRequest<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<Parsed<T>> {
  const refused = refuseCrossSite(request);
  if (refused) return { ok: false, response: refused };
  if (!allow(clientKey(request))) {
    return { ok: false, response: tooManyRequests() };
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return {
      ok: false,
      response: Response.json({ code: "BAD_REQUEST" }, { status: 400 }),
    };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      response: Response.json({ code: "BAD_REQUEST" }, { status: 400 }),
    };
  }
  return { ok: true, value: parsed.data };
}

/**
 * What the form needs to word a failure: the stable code, never Supabase's
 * English sentence. The status stays inside the 4xx range so a provider outage
 * is not reported as the learner's mistake or as this server's.
 */
export function authFailure(error: AuthApiError | null | undefined): Response {
  const status =
    error?.status && error.status >= 400 && error.status < 500
      ? error.status
      : 400;
  return Response.json(
    {
      error: {
        code: error?.code,
        status: error?.status,
        name: error?.name,
      },
    },
    { status },
  );
}

export function authSuccess(body: Record<string, unknown> = {}): Response {
  return Response.json(
    { ...body },
    { headers: { "cache-control": "no-store" } },
  );
}
