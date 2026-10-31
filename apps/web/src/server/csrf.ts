import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

function forbidden(reason: string): Response {
  return Response.json({ code: "FORBIDDEN", reason }, { status: 403 });
}

/**
 * Refuses a request that a page on another site could have caused.
 *
 * The browser attaches the session cookie to anything sent to this origin, so
 * the cookie alone proves nothing about who asked. Three checks, each enough
 * on its own against the usual attacks and together against odd browsers:
 * the custom header (cannot be added cross-site without a preflight, which no
 * route here answers), `Sec-Fetch-Site`, and a same-host `Origin`.
 *
 * Returns the refusal, or null when the request may proceed.
 */
export function refuseCrossSite(request: Request): Response | null {
  if (request.headers.get(CSRF_HEADER) !== CSRF_VALUE) {
    return forbidden("missing-header");
  }

  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return forbidden("cross-site");
  }

  const origin = request.headers.get("origin");
  if (origin) {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      // Falls through to the refusal below.
    }
    if (!host || originHost !== host) return forbidden("origin-mismatch");
  }

  return null;
}

/** The page origin the browser used, for links that come back to this site. */
export function requestOrigin(request: Request): string {
  return request.headers.get("origin") ?? new URL(request.url).origin;
}
