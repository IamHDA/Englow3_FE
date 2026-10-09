import { bffGraphqlUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";
import {
  clientKey,
  createRateLimiter,
  tooManyRequests,
} from "@/server/rateLimit";

export const dynamic = "force-dynamic";

/** A GraphQL document is kilobytes; the BFF refuses more than 128kb as well. */
const MAX_BODY_BYTES = 128 * 1024;

const allow = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
});

/**
 * The browser's only way to the BFF. It sends its GraphQL here, to its own
 * origin, and the server adds the token from the session cookie. The token
 * never reaches the page, so a script injected into it has nothing to steal.
 */
export async function POST(request: Request) {
  const refused = refuseCrossSite(request);
  if (refused) return refused;
  if (!allow(clientKey(request))) return tooManyRequests();

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return Response.json({ code: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  return forwardToBff(bffGraphqlUrl, {
    method: "POST",
    body,
    contentType: request.headers.get("content-type") ?? "application/json",
    // The shape Apollo reads an error from, with the code the BFF itself uses.
    unreachable: () =>
      Response.json(
        {
          errors: [
            {
              message: "The service is not reachable right now.",
              extensions: { code: "BACKEND_UNAVAILABLE" },
            },
          ],
        },
        { status: 502 },
      ),
  });
}
