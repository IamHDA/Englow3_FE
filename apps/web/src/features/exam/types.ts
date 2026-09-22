import type { TargetLevel } from "@/lib/graphql/generated/schemaTypes";
import type {
  AttemptPaperQuery,
  ExamAttemptResultQuery,
  ExamDetailQuery,
  ExamLibraryQuery,
} from "@/lib/graphql/generated/documents";
import type { SortKey } from "./constants/examLibrary";

/**
 * Đề thi như người học nhìn thấy trong lúc làm bài. Lấy từ `attemptPaper` chứ
 * không phải từ id đề: backend chỉ trả đề qua một lượt thi đang mở, và bản này
 * đã bị gỡ đáp án đúng.
 *
 * Khai báo một lần ở đây vì năm block đều cần - trước đó mỗi file tự dựng lại
 * `NonNullable<...Query[...]>` và cả năm phải sửa khi schema đổi.
 */
export type ExamPaper = AttemptPaperQuery["attemptPaper"];
export type ExamPaperSection = ExamPaper["sections"][number];
export type ExamPaperPart = ExamPaperSection["parts"][number];
export type ExamPaperQuestionSet = ExamPaperPart["questionSets"][number];
export type ExamPaperQuestion = ExamPaperQuestionSet["questions"][number];

/** Bản tóm tắt đề, đọc được trước khi mở lượt thi. */
export type ExamSummary = NonNullable<ExamDetailQuery["exam"]>;

/**
 * Một dòng trong thư viện đề, kèm hai con số của riêng người học. Lấy từ
 * codegen chứ không tự khai lại: `ExamCard` từng tự viết shape này, nên khi
 * schema đổi tên `bestScore` thành `bestScorePercentage` thì không có gì báo
 * lỗi - thẻ chỉ lặng lẽ đọc `undefined` và không hiện điểm nào.
 */
export type ExamListItem = ExamLibraryQuery["exams"]["items"][number];

/** Lượt thi đã chấm, kèm đáp án đúng - chỉ có sau khi nộp bài. */
export type ExamAttemptResult = ExamAttemptResultQuery["examAttempt"];
export type AttemptQuestionReview = ExamAttemptResult["questions"][number];

export type ExamFiltersState = {
  searchQuery: string;
  tabId: string;
  skill: string;
  targetLevel: TargetLevel | "ALL";
  attemptStatus: string;
  sortBy: SortKey;
  page: number;
};
