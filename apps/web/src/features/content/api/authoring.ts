import { supabase } from "@/lib/supabase/client";

const base = (
  process.env.NEXT_PUBLIC_BFF_GRAPHQL_URL ?? "http://localhost:4000/graphql"
).replace(/\/graphql\/?$/, "/rest/admin/authoring");
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
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new AuthoringError("UNAUTHENTICATED");
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
        authorization: `Bearer ${data.session.access_token}`,
        ...(body === undefined ? {} : { "content-type": type }),
      },
      body: file ? body : body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new AuthoringError("BACKEND_UNREACHABLE");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new AuthoringError(
      payload.code ?? `HTTP_${response.status}`,
      payload.fieldErrors ?? {},
    );
  return payload as T;
}
