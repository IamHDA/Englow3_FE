import { bffRestUrl, forwardToBff } from "@/server/bff";
import { refuseCrossSite } from "@/server/csrf";
import {
  clientKey,
  createRateLimiter,
  tooManyRequests,
} from "@/server/rateLimit";

export const dynamic = "force-dynamic";

const UUID = "[0-9a-fA-F-]{36}";

/**
 * The BFF's REST endpoints the admin screens use, and nothing else. A prefix
 * match would turn this route into a way to reach any path under /rest; the
 * list is the paths the editors and importers actually call.
 */
const ALLOWED = new RegExp(
  `^admin/(` +
    `authoring/[A-Z_]+(/${UUID}(/(media|content))?)?` +
    `|flashcards/import/validate` +
    `|flashcards/sets/${UUID}/import` +
    `|dictation/import(/validate)?` +
    `)$`,
);

const allow = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
});

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: Request, { params }: Context) {
  const refused = refuseCrossSite(request);
  if (refused) return refused;
  if (!allow(clientKey(request))) return tooManyRequests();

  const path = (await params).path.join("/");
  if (!ALLOWED.test(path)) {
    return Response.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  return forwardToBff(`${bffRestUrl}/${path}`, {
    method: request.method,
    // Streamed through, so an uploaded recording is not held in memory here.
    body: hasBody ? request.body : null,
    contentType: request.headers.get("content-type"),
    unreachable: () =>
      Response.json({ code: "BACKEND_UNREACHABLE" }, { status: 502 }),
  });
}

export { handle as GET, handle as POST, handle as PUT };
