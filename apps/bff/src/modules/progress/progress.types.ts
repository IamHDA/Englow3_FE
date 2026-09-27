// mirrors the progress module's REST contract exactly as the backend returns it.

// GET /api/daily-path
export type DailyPathResponse = {
  streakDays: number;
  /** Derived from activity on every read, not stored - see the backend's ExperiencePoints. */
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  levelCostXp: number;
  tasks: {
    kind: "FLASHCARD_REVIEW" | "DICTATION" | "QUIZ";
    status: "COMPLETED" | "CURRENT" | "UPCOMING";
    targetId: string;
    title: string;
    order: number;
    unitsRemaining: number;
    unitsDoneToday: number;
    completionPercent: number | null;
    xpReward: number;
  }[];
  quests: {
    kind:
      | "REVIEW_DUE_CARDS"
      | "PASS_A_QUIZ"
      | "TYPE_SENTENCES"
      | "PRACTISE_EVERY_DAY";
    progress: number;
    target: number;
    completed: boolean;
  }[];
};
