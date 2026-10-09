import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Where the BFF is, as the server sees it. `BFF_GRAPHQL_URL` is server-only;
 * the public variable is the fallback so a deployment configured before the
 * browser stopped calling the BFF keeps working without a change.
 */
export const bffGraphqlUrl =
  process.env.BFF_GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_BFF_GRAPHQL_URL ??
  "http://localhost:4000/graphql";

export const bffRestUrl = bffGraphqlUrl.replace(/\/graphql\/?$/, "/rest");

const TIMEOUT_MS = 60_000;

/**
 * The signed-in user's token as an `Authorization` header, or nothing for a
 * guest. Reading the session refreshes an expired access token and writes the
 * renewed cookies, so a tab left open for hours keeps working.
 */
async function authorization(): Promise<Record<string, string>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { authorization: `Bearer ${session.access_token}` } : {};
}

type Forward = {
  method: string;
  body?: BodyInit | null;
  contentType?: string | null;
  /** What to answer when the BFF cannot be reached at all. */
  unreachable: () => Response;
};

/**
 * Sends a request on to the BFF as the signed-in user and hands the answer
 * back unchanged. The token is added here, on the server; the browser that
 * asked never holds it.
 */
export async function forwardToBff(
  url: string,
  { method, body, contentType, unreachable }: Forward,
): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method,
      headers: {
        ...(contentType ? { "content-type": contentType } : {}),
        ...(await authorization()),
      },
      body: body ?? undefined,
      // A request body that is a stream must say it will not be replayed.
      ...(body && typeof body !== "string" ? { duplex: "half" } : {}),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    } as RequestInit);
  } catch {
    return unreachable();
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}
