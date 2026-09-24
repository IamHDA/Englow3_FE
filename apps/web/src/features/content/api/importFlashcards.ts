/** What the backend says a file would do, or did. */
export interface FlashcardImportReport {
  committed: boolean;
  acceptedCount: number;
  rejectedCount: number;
  /** The backend names the row by lemma for cards and by clip id for dictation. */
  rejections: {
    index: number;
    lemma?: string;
    clipId?: string;
    reason: string;
  }[];
  /** Dictation only: lines across every lesson in the batch. */
  sentenceCount?: number;
}

const BFF_REST_URL = (
  process.env.NEXT_PUBLIC_BFF_GRAPHQL_URL ?? "http://localhost:4000/graphql"
).replace(/\/graphql$/, "/rest");

/**
 * Uploads a batch over REST rather than GraphQL.
 *
 * A generated file is megabytes. Sending it as a string inside a GraphQL
 * document would mean raising the body cap for every query the app makes to
 * accommodate the one request that needs it.
 */
async function post(
  path: string,
  json: string,
  token: string,
): Promise<FlashcardImportReport> {
  const response = await fetch(`${BFF_REST_URL}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: json,
  });

  const body = await response.text();
  if (!response.ok) {
    // The backend's message is shown as it came: it names the row or the
    // reason, and replacing it with a generic line would throw that away.
    throw new Error(readMessage(body));
  }
  return JSON.parse(body) as FlashcardImportReport;
}

function readMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string };
    return parsed.message ?? "Không import được tệp này.";
  } catch {
    return "Không import được tệp này.";
  }
}

export function validateFlashcardImport(json: string, token: string) {
  return post("/admin/flashcards/import/validate", json, token);
}

export function importFlashcards(setId: string, json: string, token: string) {
  return post(
    `/admin/flashcards/sets/${encodeURIComponent(setId)}/import`,
    json,
    token,
  );
}

/**
 * A shadowing batch, which creates its own lessons rather than filling one.
 *
 * Reported with a sentence count as well as a lesson count: thirty clips of
 * four lines and thirty of forty are the same number of lessons and very
 * different amounts of content.
 */
export function validateDictationImport(json: string, token: string) {
  return post("/admin/dictation/import/validate", json, token);
}

export function importDictation(json: string, token: string) {
  return post("/admin/dictation/import", json, token);
}
