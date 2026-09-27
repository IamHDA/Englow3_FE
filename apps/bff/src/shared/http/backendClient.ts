import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { env } from "../../config/env.js";
import { BackendError } from "./backendError.js";

/** One per request - it carries a per-request token, never share across requests. */
export class BackendClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
    private readonly token?: string,
    private readonly requestId?: string,
  ) {}

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  /**
   * The backend's DELETE routes answer with the resource in its new state rather
   * than with 204, so this reads a body like the rest.
   */
  delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  /**
   * The request without reading the answer, for a caller that hands the
   * backend's own status and body on as they are. Only a failure to reach the
   * backend throws; a refusal comes back as a Response like any other.
   */
  async send(method: string, path: string, body?: unknown): Promise<Response> {
    // A FormData body sets its own multipart content-type, boundary included.
    const upload = body instanceof FormData;
    const start = Date.now();
    try {
      return await fetch(`${this.baseUrl}${path}`, {
        method,
        // Left off for uploads, as before this client carried them.
        keepalive: !upload,
        headers: {
          ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
          ...(this.requestId ? { "x-request-id": this.requestId } : {}),
          ...(body !== undefined && !upload
            ? { "content-type": "application/json" }
            : {}),
        },
        body: upload
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      // Connection refused, DNS failure, or the timeout above firing - the
      // backend was never reached, so there is no HTTP status to report.
      throw new BackendError(
        "Failed to reach the backend service",
        0,
        undefined,
        undefined,
        method,
        path,
        Date.now() - start,
      );
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const start = Date.now();
    const response = await this.send(method, path, body);
    if (!response.ok) {
      throw await BackendError.fromResponse(
        response,
        method,
        path,
        Date.now() - start,
      );
    }
    return (await response.json()) as T;
  }
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

// Matches what randomUUID() produces, so only a well-formed id is ever
// adopted - never an arbitrary string a client typed into the backend's logs.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The one way an incoming request becomes a backend client, so GraphQL and REST
 * agree on whose token goes out and which request id it travels under. The token
 * comes back too: `null` is a caller with none, and each route decides how to
 * refuse that.
 *
 * The request id is made here, one per incoming request, so every backend call a
 * GraphQL operation fans out into shares it. A caller's own `x-request-id` is
 * reused when it is a UUID (so a trace that starts upstream keeps its id end to
 * end); anything else is replaced rather than forwarded into the backend's logs.
 */
export function createBackendClient(headers: IncomingHttpHeaders) {
  const token = extractBearerToken(headers.authorization);
  const incomingRequestId = headers["x-request-id"];
  const requestId =
    typeof incomingRequestId === "string" && UUID_RE.test(incomingRequestId)
      ? incomingRequestId
      : randomUUID();

  return {
    token,
    requestId,
    client: new BackendClient(
      env.backendUrl,
      env.backendTimeoutMs,
      token ?? undefined,
      requestId,
    ),
  };
}
