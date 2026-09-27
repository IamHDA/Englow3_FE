// mirrors the dictation module's REST contract exactly as the backend returns it.

// GET /api/dictation/lessons
export type DictationLessonResponse = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  targetLevel: string | null;
  sentenceCount: number;
  /** Per learner: sentences whose best attempt cleared the completion threshold. */
  completedSentenceCount: number;
  totalDurationSeconds: number;
  lastPractisedAt: string | null;
};

export type DictationLessonPageResponse = {
  items: DictationLessonResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

// A sentence as the learner practises it. There is deliberately no transcript
// field: the answer arrives only in the response to a submission.
export type DictationSentenceResponse = {
  id: string;
  orderNo: number;
  audioUrl: string;
  audioDurationSeconds: number;
  hintWordCount: number;
  hintFirstLetters: string | null;
  hintRevealWord: string | null;
  hintPartialTranscript: string | null;
  /** Both null means the file is this sentence; see the typeDefs. */
  audioStartMs: number | null;
  audioEndMs: number | null;
  bestAccuracyPercent: number | null;
};

// GET /api/dictation/lessons/{id}
export type DictationLessonDetailResponse = {
  lesson: DictationLessonResponse;
  sentences: DictationSentenceResponse[];
};

// POST /api/dictation/sentences/{id}/attempts - the only shape carrying the transcript
export type DictationSubmissionResponse = {
  sentenceId: string;
  correctText: string;
  translationVi: string | null;
  response: string;
  accuracyPercent: number;
  correctWordCount: number;
  totalWordCount: number;
  cleared: boolean;
};

// GET /api/dictation/stats
export type DictationStatsResponse = {
  periodDays: number;
  lessonsCompleted: number;
  averageAccuracyPercent: number;
  listeningSeconds: number;
  sentencesPractised: number;
  streakDays: number;
  activity: { day: string; accuracyPercent: number; attemptCount: number }[];
  missedWords: {
    word: string;
    missedCount: number;
    correctCount: number;
    accuracyPercent: number;
  }[];
  difficultSentences: {
    sentenceId: string;
    text: string;
    topic: string;
    accuracyPercent: number;
    attemptCount: number;
  }[];
  history: {
    day: string;
    lessonId: string;
    lessonTitle: string;
    sentenceCount: number;
    accuracyPercent: number;
    listeningSeconds: number;
  }[];
};

// GET /api/dictation/mistakes
export type MistakeSentenceResponse = {
  sentenceId: string;
  audioUrl: string;
  audioDurationSeconds: number;
  /** Both null means the file is this line; see the typeDefs. */
  audioStartMs: number | null;
  audioEndMs: number | null;
  lessonId: string;
  lessonTitle: string;
  bestAccuracyPercent: number;
  attemptCount: number;
  /** The last thing they typed, so the screen can show what changed. */
  lastResponse: string | null;
};
