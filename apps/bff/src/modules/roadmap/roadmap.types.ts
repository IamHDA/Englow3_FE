import type { paths } from "../../generated/backend-openapi.js";

// mirror the backend's /api/roadmap answers exactly as it sends them.
export type RoadmapResponse =
  paths["/api/roadmap"]["post"]["responses"][200]["content"]["application/json"];

export type LevelCheckResponse =
  paths["/api/roadmap/level-checks"]["post"]["responses"][200]["content"]["application/json"];

export type StartLevelCheckRequest =
  paths["/api/roadmap/level-checks"]["post"]["requestBody"]["content"]["application/json"];
