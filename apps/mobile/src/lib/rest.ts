import { fetch } from "expo/fetch";

import { accessToken } from "./apollo";
import { env } from "./env";

export class RestError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
    this.name = "RestError";
  }
}

/**
 * One call to the BFF's REST routes (`/rest/...`) with the learner's token.
 * Failures carry the backend's error code, as GraphQL errors do.
 */
export async function rest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = await accessToken();
  const response = await fetch(`${env.bffUrl}/rest${path}`, {
    method: init.method ?? "GET",
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.body !== undefined
        ? { "content-type": "application/json" }
        : {}),
    },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      code?: unknown;
    } | null;
    throw new RestError(
      typeof body?.code === "string" ? body.code : "UNKNOWN",
      response.status,
    );
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}
