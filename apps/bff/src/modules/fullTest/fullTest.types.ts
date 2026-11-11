import type { paths } from "../../generated/backend-openapi.js";

// mirror the backend's IELTS full test answers exactly as it sends them
// (Englow3_BE exam/controller/FullTestController and AdminFullTestController).

// GET /api/full-tests - published full tests, newest first
export type FullTestResponse =
  paths["/api/full-tests"]["get"]["responses"][200]["content"]["application/json"][number];

// POST /api/full-tests/{id}/sittings, GET /api/full-test-sittings/{id}
export type FullTestSittingResponse =
  paths["/api/full-tests/{id}/sittings"]["post"]["responses"][200]["content"]["application/json"];

export type FullTestPartStartResponse =
  paths["/api/full-test-sittings/{id}/parts/{slot}"]["post"]["responses"][200]["content"]["application/json"];

// POST /api/admin/full-tests (201) and PUT /api/admin/full-tests/{id}
export type SaveFullTestRequest =
  paths["/api/admin/full-tests"]["post"]["requestBody"]["content"]["application/json"];
