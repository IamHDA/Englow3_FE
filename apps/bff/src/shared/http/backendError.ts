type ApiErrorResponse = {
  code?: string;
  message?: string;
  traceId?: string;
};

/**
 * status 0 means the request never reached the backend (network failure or
 * timeout) - there is no HTTP response to read a status from.
 */
export class BackendError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly traceId?: string,
  ) {
    super(message);
    this.name = "BackendError";
  }

  static async fromResponse(response: Response): Promise<BackendError> {
    let body: ApiErrorResponse | undefined;
    try {
      body = (await response.json()) as ApiErrorResponse;
    } catch {
      // Backend didn't return a JSON body (e.g. a proxy error page) - fall
      // through with just the HTTP status.
    }
    return new BackendError(
      body?.message ?? response.statusText,
      response.status,
      body?.code,
      body?.traceId,
    );
  }
}
