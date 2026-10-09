import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";

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

/**
 * This app's own route, which adds the signed-in user's token on the server and
 * passes the request on to the BFF. The page holds no token to attach.
 */
const REST_URL = "/api/bff/rest";

/** The server had no session to send on: it expired, or the user signed out elsewhere. */
export class ImportSessionExpiredError extends Error {
  constructor() {
    super("SESSION_EXPIRED");
  }
}

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
): Promise<FlashcardImportReport> {
  const response = await fetch(`${REST_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      [CSRF_HEADER]: CSRF_VALUE,
    },
    body: json,
    credentials: "same-origin",
    signal: AbortSignal.timeout(60_000),
  });

  const body = await response.text();
  if (response.status === 401) throw new ImportSessionExpiredError();
  if (!response.ok) {
    // The backend's message is shown as it came: it names the row or the
    // reason, and replacing it with a generic line would throw that away.
    throw new Error(readMessage(body));
  }
  try {
    const report = JSON.parse(body) as FlashcardImportReport;
    if (
      typeof report.committed !== "boolean" ||
      !Array.isArray(report.rejections) ||
      !Number.isInteger(report.acceptedCount) ||
      !Number.isInteger(report.rejectedCount)
    ) {
      throw new Error("Invalid report");
    }
    return report;
  } catch {
    throw new Error(
      "Máy chủ trả về báo cáo không hợp lệ. Tải lại danh sách để kiểm tra trước khi nhập lại.",
    );
  }
}

function readMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string };
    return parsed.message ?? "Không import được tệp này.";
  } catch {
    return "Không import được tệp này.";
  }
}

export function validateFlashcardImport(json: string) {
  return post("/admin/flashcards/import/validate", json);
}

export function importFlashcards(setId: string, json: string) {
  return post(
    `/admin/flashcards/sets/${encodeURIComponent(setId)}/import`,
    json,
  );
}

/**
 * A shadowing batch, which creates its own lessons rather than filling one.
 *
 * Reported with a sentence count as well as a lesson count: thirty clips of
 * four lines and thirty of forty are the same number of lessons and very
 * different amounts of content.
 */
export function validateDictationImport(json: string) {
  return post("/admin/dictation/import/validate", json);
}

export function importDictation(json: string) {
  return post("/admin/dictation/import", json);
}
