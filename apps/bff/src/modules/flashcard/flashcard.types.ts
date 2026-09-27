import type { paths } from "../../generated/backend-openapi.js";

// mirrors the flashcard module's REST contract exactly as the backend returns it.

// GET /api/flashcards/sets
export type FlashcardSetPageResponse =
  paths["/api/flashcards/sets"]["get"]["responses"][200]["content"]["application/json"];
export type FlashcardSetResponse = FlashcardSetPageResponse["items"][number];

// Audio arrives pre-signed and short-lived; the backend resolves object keys for us.
// GET /api/flashcards/sets/{id}/study-queue - also the card shape on set detail
export type FlashcardResponse =
  paths["/api/flashcards/sets/{id}/study-queue"]["get"]["responses"][200]["content"]["application/json"][number];

// GET /api/flashcards/sets/{id}
export type FlashcardSetDetailResponse =
  paths["/api/flashcards/sets/{id}"]["get"]["responses"][200]["content"]["application/json"];

// POST /api/flashcards/{id}/reviews
export type FlashcardReviewResponse =
  paths["/api/flashcards/{id}/reviews"]["post"]["responses"][200]["content"]["application/json"];
export type RateFlashcardRequest =
  paths["/api/flashcards/{id}/reviews"]["post"]["requestBody"]["content"]["application/json"];

// GET /api/flashcards/stats
export type FlashcardStatsResponse =
  paths["/api/flashcards/stats"]["get"]["responses"][200]["content"]["application/json"];
