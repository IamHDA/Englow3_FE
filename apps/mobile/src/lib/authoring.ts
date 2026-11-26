import { fetch } from "expo/fetch";

import { accessToken } from "./apollo";
import { env } from "./env";

/** A refused authoring call: the backend's code and, for a form, which fields it blamed. */
export class AuthoringError extends Error {
  constructor(
    readonly code: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(code);
    this.name = "AuthoringError";
  }
}

export type MediaFile = { contentType: string; bytes: Uint8Array };

/**
 * The BFF's authoring routes (`/rest/admin/authoring/...`), as the web's
 * features/content/api/authoring.ts calls them: JSON for content trees, raw
 * bytes for a media upload (the BFF wraps those into the backend's form).
 */
export async function authoringRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const token = await accessToken();
  const media = isMedia(body);
  let response;
  try {
    response = await fetch(`${env.bffUrl}/rest/admin/authoring/${path}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body === undefined
          ? {}
          : {
              "content-type": media ? body.contentType : "application/json",
            }),
      },
      body: media
        ? (body.bytes.buffer.slice(
            body.bytes.byteOffset,
            body.bytes.byteOffset + body.bytes.byteLength,
          ) as ArrayBuffer)
        : body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  } catch {
    throw new AuthoringError("BACKEND_UNREACHABLE");
  }
  const payload = (await response.json().catch(() => ({}))) as {
    code?: string;
    fieldErrors?: Record<string, string>;
  };
  if (response.status === 401) throw new AuthoringError("UNAUTHENTICATED");
  if (!response.ok)
    throw new AuthoringError(
      payload.code ?? `HTTP_${response.status}`,
      payload.fieldErrors ?? {},
    );
  return payload as T;
}

function isMedia(body: unknown): body is MediaFile {
  return (
    typeof body === "object" &&
    body !== null &&
    "bytes" in body &&
    body.bytes instanceof Uint8Array
  );
}
