import type { paths } from "../../generated/backend-openapi.js";

// mirror the backend's AI generation answers exactly as it sends them
// (Englow3_BE generation/controller/AdminGenerationController).

// POST /api/admin/generation/requests (201; the spec records it as 200)
export type RequestGenerationRequest =
  paths["/api/admin/generation/requests"]["post"]["requestBody"]["content"]["application/json"];

export type GenerationRequestResponse =
  paths["/api/admin/generation/requests"]["post"]["responses"][200]["content"]["application/json"];

// GET /api/admin/generation/requests
export type GenerationRequestPage =
  paths["/api/admin/generation/requests"]["get"]["responses"][200]["content"]["application/json"];

// GET /api/admin/generation/allowance
export type GenerationAllowanceResponse =
  paths["/api/admin/generation/allowance"]["get"]["responses"][200]["content"]["application/json"];
