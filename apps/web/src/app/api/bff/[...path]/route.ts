import {
  createSupabaseServerClient,
  rememberSessionPreference,
} from "@/lib/supabase/server";
import { bffBaseUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";
import {
  clientAddress,
  clientKey,
  createRateLimiter,
  tooManyRequests,
} from "@/server/rateLimit";

export const dynamic = "force-dynamic";
// Export and the tutor stream are the slow ones; everything else ends long
// before this through its own timeout below.
export const maxDuration = 60;

/**
 * The browser's one way to the BFF. The session cookie belongs to this
 * origin and the BFF lives on another, so a page cannot send it there - and
 * must not hold the token itself. This route reads the cookie on the server,
 * adds the token, and passes the request on unchanged.
 *
 * It owns what is tied to this origin's cookie: the cross-site check, a
 * per-caller ceiling, and clearing the cookie once an account is erased.
 * Which paths exist and what their input may be is the BFF's to decide; a
 * second copy of that here was a second place for it to be wrong.
 */

type Mount = {
  timeoutMs: number;
  allow: (key: string) => boolean;
  /** A health probe sends no cookie-bearing request worth defending. */
  public?: boolean;
  unreachable: () => Response;
};

const unavailable = () =>
  Response.json({ code: "BACKEND_UNAVAILABLE" }, { status: 502 });

const general = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
};

/** The BFF's top-level routes, as `apps/bff/src/app.ts` mounts them. */
const MOUNTS: Record<string, Mount> = {
  graphql: {
    timeoutMs: 12_000,
    allow: createRateLimiter(general),
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
  },
  rest: {
    timeoutMs: 58_000,
    allow: createRateLimiter(general),
    unreachable: unavailable,
  },
  system: {
    timeoutMs: 6_000,
    allow: createRateLimiter({ windowMs: 60_000, max: 60 }),
    public: true,
    unreachable: unavailable,
  },
};

const ERASE_PATH = "rest/account/erase";

/** Erasing is done once; a handful of tries a minute covers a mistyped email and stops a script. */
const allowErase = createRateLimiter({ windowMs: 60_000, max: 5 });

/** Plain path segments only: nothing that could climb out of the BFF's own routes. */
const SEGMENT = /^[A-Za-z0-9_-]+$/;

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: Request, { params }: Context) {
  const segments = (await params).path;
  const mount = MOUNTS[segments[0]];
  if (!mount || !segments.every((segment) => SEGMENT.test(segment))) {
    return Response.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  const path = segments.join("/");

  if (!mount.public) {
    const refused = refuseCrossSite(request);
    if (refused) return refused;
  }
  const key = clientKey(request);
  if (!mount.allow(key)) return tooManyRequests();
  if (path === ERASE_PATH && !allowErase(key)) return tooManyRequests();

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const answer = await forwardToBff(
    `${bffBaseUrl}/${path}${new URL(request.url).search}`,
    {
      method: request.method,
      body: hasBody ? request.body : undefined,
      contentType: request.headers.get("content-type"),
      timeoutMs: mount.timeoutMs,
      // A read (the tutor stream above all) stops when the browser leaves; a
      // write does not, so an accepted upload or erasure is not abandoned
      // halfway because a tab closed.
      signal: hasBody ? undefined : request.signal,
      clientIp: clientAddress(request.headers),
      unreachable: mount.unreachable,
    },
  );

  // The backend deletes the sign-in itself, so the cookie left behind names
  // someone who no longer exists; clearing it stops the next page load from
  // treating this browser as a user.
  if (path === ERASE_PATH && answer.status === 204) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    await rememberSessionPreference(false);
  }
  return answer;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
