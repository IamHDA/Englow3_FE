import type { paths } from "../../generated/backend-openapi.js";
import type {
  TranslationMistakeType,
  TranslationVerdict,
} from "../../generated/graphql.js";

// GET /api/translation/sets
export type TranslationSetPageResponse =
  paths["/api/translation/sets"]["get"]["responses"][200]["content"]["application/json"];

// GET /api/translation/sets/{id}
export type TranslationSetDetailResponse =
  paths["/api/translation/sets/{id}"]["get"]["responses"][200]["content"]["application/json"];

type RawTranslationAttemptResponse =
  paths["/api/translation/attempts/{id}"]["get"]["responses"][200]["content"]["application/json"];
type RawFeedback = NonNullable<RawTranslationAttemptResponse["feedback"]>;

/**
 * `verdict` and each mistake's `type` are plain `String`s in the backend
 * records, so OpenAPI can only call them strings. `TranslationRubric` refuses
 * any other value before a report is stored, which is what makes the narrower
 * types below true on the wire.
 */
type TranslationFeedback = Omit<RawFeedback, "verdict" | "errors"> & {
  verdict: TranslationVerdict;
  errors: (Omit<RawFeedback["errors"][number], "type"> & {
    type: TranslationMistakeType;
  })[];
};

export type TranslationAttemptResponse = Omit<
  RawTranslationAttemptResponse,
  "feedback"
> & {
  feedback: TranslationFeedback | null;
};

export type TranslationAttemptPageResponse = Omit<
  paths["/api/translation/attempts"]["get"]["responses"][200]["content"]["application/json"],
  "items"
> & {
  items: TranslationAttemptResponse[];
};
