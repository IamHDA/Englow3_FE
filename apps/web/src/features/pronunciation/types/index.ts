export type PronunciationCategory =
  | "Minimal Pairs"
  | "Daily Conversations"
  | "IELTS Speaking"
  | "Business Pitch"
  | "Intonation & Stress";

export type PronunciationLevel = "Beginner" | "Intermediate" | "Advanced";

export interface PhonemeItem {
  symbol: string;
  soundType: "vowel" | "consonant" | "stress";
  isKeyTarget?: boolean;
}

export interface PronunciationLesson {
  id: string;
  slug: string;
  title: string;
  category: PronunciationCategory;
  level: PronunciationLevel;
  phonemeTarget: string; // e.g. "/iː/ vs /ɪ/"
  targetSentence: string;
  ipaTranscript: string;
  translationVi: string;
  phonemes: PhonemeItem[];
  tips: string[];
  bestScore?: number;
}

export interface PhonemeScoreDetail {
  phoneme: string;
  score: number;
  status: "good" | "warning" | "error";
  hint: string;
}

export interface PronunciationEvaluationResult {
  lessonId: string;
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  intonationScore: number;
  transcribedText: string;
  phonemeScores: PhonemeScoreDetail[];
  feedbackMessage: string;
  aiCoachingTip: string;
  userAudioBlobUrl?: string;
}

export interface IpaChartSound {
  symbol: string;
  example: string;
  type: "monophthong" | "diphthong" | "consonant";
  isMastered: boolean;
}
