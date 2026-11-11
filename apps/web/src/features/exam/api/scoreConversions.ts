import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";
export type ScoreConversion = {
  id: number;
  sectionType: "LISTENING" | "READING";
  rawScoreFrom: number;
  rawScoreTo: number;
  convertedScore: number;
  effectiveFrom: string;
  sourceReference: string | null;
};
export class ScoreConfigurationError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}
const url = "/api/bff/rest/admin/exam-score-conversions/toeic";
export async function scoreConversions(signal: AbortSignal) {
  return read(
    await fetch(url, { signal, cache: "no-store", credentials: "same-origin" }),
  );
}
export async function publishScoreConversions(
  effectiveFrom: string,
  sourceReference: string,
  rows: unknown[],
) {
  return read(
    await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      signal: AbortSignal.timeout(15_000),
      headers: {
        "content-type": "application/json",
        [CSRF_HEADER]: CSRF_VALUE,
      },
      body: JSON.stringify({ effectiveFrom, sourceReference, rows }),
    }),
  );
}
async function read(response: Response): Promise<ScoreConversion[]> {
  const body = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(body))
    throw new ScoreConfigurationError(
      typeof body?.code === "string" ? body.code : "UNKNOWN",
    );
  return body as ScoreConversion[];
}
