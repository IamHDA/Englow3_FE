import { fetch } from "expo/fetch";

import { accessToken } from "@/lib/apollo";
import { env } from "@/lib/env";

/** What the backend says a file would do, or did. As the web's api/importFlashcards. */
export interface ImportReport {
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

export class ImportSessionExpiredError extends Error {
  constructor() {
    super("SESSION_EXPIRED");
  }
}

/** Sends the generated file as it is: megabytes of JSON over REST, not inside a GraphQL document. */
async function post(path: string, json: string): Promise<ImportReport> {
  const token = await accessToken();
  const response = await fetch(`${env.bffUrl}/rest${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: json,
  });
  const body = await response.text();
  if (response.status === 401) throw new ImportSessionExpiredError();
  // The backend's message names the row or the reason; show it as it came.
  if (!response.ok) throw new Error(readMessage(body));
  return parseReport(body);
}

export function parseReport(body: string): ImportReport {
  let report: ImportReport;
  try {
    report = JSON.parse(body) as ImportReport;
  } catch {
    report = {} as ImportReport;
  }
  if (
    typeof report.committed !== "boolean" ||
    !Array.isArray(report.rejections) ||
    !Number.isInteger(report.acceptedCount) ||
    !Number.isInteger(report.rejectedCount)
  )
    throw new Error(
      "Máy chủ trả về báo cáo không hợp lệ. Tải lại danh sách để kiểm tra trước khi nhập lại.",
    );
  return report;
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

/** A shadowing batch creates its own lessons, one per clip. */
export function validateDictationImport(json: string) {
  return post("/admin/dictation/import/validate", json);
}

export function importDictation(json: string) {
  return post("/admin/dictation/import", json);
}
