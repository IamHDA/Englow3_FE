import type {
  DailyQuestKind,
  DailyTaskKind,
  DailyTaskStatus,
} from "../../generated/graphql.js";

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
    kind: DailyTaskKind;
    status: DailyTaskStatus;
    targetId: string;
    title: string;
    order: number;
    unitsRemaining: number;
    unitsDoneToday: number;
    completionPercent: number | null;
    xpReward: number;
  }[];
  quests: {
    kind: DailyQuestKind;
    progress: number;
    target: number;
    completed: boolean;
  }[];
};
