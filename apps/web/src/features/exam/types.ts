import type { TargetLevel } from "@/lib/graphql/generated/schemaTypes";
import type { SortKey } from "./constants/examLibrary";

export type ExamFiltersState = {
  searchQuery: string;
  tabId: string;
  skill: string;
  targetLevel: TargetLevel | "ALL";
  attemptStatus: string;
  sortBy: SortKey;
  page: number;
};
