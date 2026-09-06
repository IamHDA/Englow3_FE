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

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
          ...(this.requestId ? { "x-request-id": this.requestId } : {}),
          ...(body !== undefined
            ? { "content-type": "application/json" }
            : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch {
      // Connection refused, DNS failure, or the timeout above firing - the
      // backend was never reached, so there is no HTTP status to report.
      throw new BackendError("Failed to reach the backend service", 0);
    }

    if (!response.ok) {
      throw await BackendError.fromResponse(response);
    }
    return (await response.json()) as T;
  }
}
