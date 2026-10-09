import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

/**
 * This app's own route, which adds the signed-in user's token on the server and
 * passes the request on to the BFF. The page holds no token to attach.
 */
const base = "/api/bff/rest/admin/authoring";
export class AuthoringError extends Error {
  constructor(
    public code: string,
    public fields: Record<string, string> = {},
  ) {
    super(code);
  }
}
export async function authoringRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const file = body instanceof File;
  const type = file
    ? body.name.toLowerCase().endsWith(".wav")
      ? "audio/wav"
      : body.name.toLowerCase().endsWith(".mp3")
        ? "audio/mpeg"
        : body.type
    : "application/json";
  let response: Response;
  try {
    response = await fetch(`${base}/${path}`, {
      method,
      headers: {
        [CSRF_HEADER]: CSRF_VALUE,
        ...(body === undefined ? {} : { "content-type": type }),
      },
      credentials: "same-origin",
      body: file ? body : body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new AuthoringError("BACKEND_UNREACHABLE");
  }
  const payload = await response.json().catch(() => ({}));
  // No session to forward: it expired, or the user signed out in another tab.
  if (response.status === 401) throw new AuthoringError("UNAUTHENTICATED");
  if (!response.ok)
    throw new AuthoringError(
      payload.code ?? `HTTP_${response.status}`,
      payload.fieldErrors ?? {},
    );
  return payload as T;
}
