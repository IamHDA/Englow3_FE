import type { paths } from "../../generated/backend-openapi.js";

// GET /api/speaking/prompts
type RawSpeakingPromptPageResponse =
  paths["/api/speaking/prompts"]["get"]["responses"][200]["content"]["application/json"];
type RawSpeakingPromptResponse = RawSpeakingPromptPageResponse["items"][number];

/**
 * `tips` is `@JsonRawValue String tips` on the backend (see
 * SpeakingPromptResponse.java) - a real JSON array on the wire, sent as
 * coaching notes rather than a string of JSON, but invisible as such to
 * springdoc/OpenAPI. Reasserted here as the array it actually is.
 */
export type SpeakingPromptResponse = Omit<RawSpeakingPromptResponse, "tips"> & {
  tips: string[];
};
export type SpeakingPromptPageResponse = Omit<
  RawSpeakingPromptPageResponse,
  "items"
> & {
  items: SpeakingPromptResponse[];
};

// mirrors POST /api/speaking/prompts/{id}/attempts
export type SpeakingUploadTicketResponse =
  paths["/api/speaking/prompts/{id}/attempts"]["post"]["responses"][201]["content"]["application/json"];

export type SpeakingPhonemeScore = { phoneme: string; accuracy: number | null };

type RawSpeakingAttemptResponse =
  paths["/api/speaking/attempts/{id}"]["get"]["responses"][200]["content"]["application/json"];
type RawSpeakingWordResponse = RawSpeakingAttemptResponse["words"][number];

/**
 * The backend writes `phonemes` with `@JsonRawValue` (see WordResponse.java) so
 * the wire is a real JSON array, but that annotation is invisible to
 * springdoc/OpenAPI, which can only describe the record component's own Java
 * type: `String`. Reasserted here as the array it actually is.
 */
export type SpeakingWordResponse = Omit<RawSpeakingWordResponse, "phonemes"> & {
  phonemes: SpeakingPhonemeScore[];
};

/**
 * Every score is nullable and stays that way. The provider omits what it did
 * not measure - prosody unless asked for, accuracy on a recording of silence -
 * and turning a missing measurement into a zero would tell a learner they
 * scored nothing when nothing was measured.
 */
export type SpeakingAttemptResponse = Omit<
  RawSpeakingAttemptResponse,
  "words"
> & {
  /** Empty while the assessment is still queued. */
  words: SpeakingWordResponse[];
};
