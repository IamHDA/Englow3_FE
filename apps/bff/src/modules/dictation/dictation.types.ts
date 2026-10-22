import type { paths } from "../../generated/backend-openapi.js";

// mirrors the dictation module's REST contract exactly as the backend returns it.

// GET /api/dictation/lessons
export type DictationLessonPageResponse =
  paths["/api/dictation/lessons"]["get"]["responses"][200]["content"]["application/json"];
export type DictationLessonResponse =
  DictationLessonPageResponse["items"][number];

// GET /api/dictation/lessons/{id}
export type DictationLessonDetailResponse =
  paths["/api/dictation/lessons/{id}"]["get"]["responses"][200]["content"]["application/json"];
// A sentence as the learner practises it. It carries the transcript so the
// screen can mark an answer at once; the score that is stored is still the
// server's, from a submission.
export type DictationSentenceResponse =
  DictationLessonDetailResponse["sentences"][number];

// POST /api/dictation/sentences/{id}/attempts - the only shape carrying the transcript
export type DictationSubmissionResponse =
  paths["/api/dictation/sentences/{id}/attempts"]["post"]["responses"][200]["content"]["application/json"];

// GET /api/dictation/stats
export type DictationStatsResponse =
  paths["/api/dictation/stats"]["get"]["responses"][200]["content"]["application/json"];

// GET /api/dictation/mistakes
export type MistakeSentenceResponse =
  paths["/api/dictation/mistakes"]["get"]["responses"][200]["content"]["application/json"][number];
