import type { paths } from "../../generated/backend-openapi.js";

// Derived from the endpoint's own contract (Phase 07C), not hand-mirrored -
// GET /api/user/me and PUT /api/user/me/profile answer with the same shape,
// so one canonical path stands in for both.
export type UserInformationResponse =
  paths["/api/user/me"]["get"]["responses"][200]["content"]["application/json"];

export type UserTourStatusResponse =
  paths["/api/user/me/tour"]["get"]["responses"][200]["content"]["application/json"];
