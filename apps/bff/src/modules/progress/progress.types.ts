import type { paths } from "../../generated/backend-openapi.js";

// mirrors GET /api/daily-path exactly as the backend returns it.
export type DailyPathResponse =
  paths["/api/daily-path"]["get"]["responses"][200]["content"]["application/json"];
