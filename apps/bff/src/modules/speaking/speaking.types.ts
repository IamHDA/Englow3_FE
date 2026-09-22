export type SpeakingAttemptStatus =
  "AWAITING_UPLOAD" | "QUEUED" | "ASSESSED" | "FAILED";

// mirrors GET /api/speaking/prompts exactly as the backend returns it
export type SpeakingPromptResponse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  targetLevel: string | null;
  /** What the learner is asked to say. The accuracy score is accuracy against this. */
  referenceText: string;
  ipaTranscript: string | null;
  translationVi: string | null;
  phonemeTarget: string | null;
  /** Coaching notes, sent as a JSON array rather than a string of JSON. */
  tips: string[];
  /** This learner's own best, null until they have finished one. */
  bestScorePercent: number | null;
};

export type SpeakingPromptPageResponse = {
  items: SpeakingPromptResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type SpeakingPhonemeScore = {
  phoneme: string;
  accuracy: number | null;
};

export type SpeakingWordResponse = {
  orderNo: number;
  word: string;
  accuracyPercent: number | null;
  /** The provider's own label: Mispronunciation, Omission, Insertion, None. */
  errorType: string | null;
  offsetMs: number | null;
  durationMs: number | null;
  phonemes: SpeakingPhonemeScore[];
};

/**
 * Every score is nullable and stays that way. The provider omits what it did
 * not measure - prosody unless asked for, accuracy on a recording of silence -
 * and turning a missing measurement into a zero would tell a learner they
 * scored nothing when nothing was measured.
 */
export type SpeakingAttemptResponse = {
  id: string;
  speakingPromptId: string;
  promptTitle: string;
  referenceText: string;
  status: SpeakingAttemptStatus;
  /** Pre-signed and short-lived; the backend resolves the object key. */
  audioUrl: string;
  recognizedText: string | null;
  accuracyPercent: number | null;
  fluencyPercent: number | null;
  completenessPercent: number | null;
  prosodyPercent: number | null;
  pronunciationPercent: number | null;
  /** Why no score will arrive, when none will. */
  errorCode: string | null;
  createdAt: string;
  assessedAt: string | null;
  /** Empty while the assessment is still queued. */
  words: SpeakingWordResponse[];
};

// mirrors POST /api/speaking/prompts/{id}/attempts
export type SpeakingUploadTicketResponse = {
  attemptId: string;
  /** A presigned PUT straight to object storage - the audio never passes through this BFF. */
  uploadUrl: string;
  contentType: string;
  expiresInSeconds: number;
};

export type SearchSpeakingPromptsParams = {
  category?: string | null;
  title?: string | null;
  page?: number;
  size?: number;
};
