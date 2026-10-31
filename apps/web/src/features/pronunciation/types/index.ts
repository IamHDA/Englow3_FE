import type {
  SpeakingAttemptFieldsFragment,
  SpeakingPromptFieldsFragment,
} from "@/lib/graphql/generated/documents";

/**
 * Câu để luyện, và kết quả chấm một bản ghi.
 *
 * Cả hai đều lấy từ codegen. Trước đây đây là interface tự viết kèm một file
 * dữ liệu giả - danh mục bài, điểm từng âm vị, lời khuyên của "AI coach" -
 * không có cái nào đi ra từ một bản ghi thật.
 */
export type SpeakingPrompt = SpeakingPromptFieldsFragment;
export type SpeakingAttempt = SpeakingAttemptFieldsFragment;
export type SpeakingWord = SpeakingAttempt["words"][number];
export type SpeakingPhonemeScore = SpeakingWord["phonemes"][number];

/**
 * Bảng IPA của trang thư viện. Vẫn là dữ liệu tĩnh, và đúng là như vậy: đây là
 * bảng âm vị tiếng Anh, không phải số liệu của người học. Cái đã bỏ đi là cờ
 * `isMastered` - nó nói người học đã thạo âm nào, mà chẳng có gì đo điều đó.
 */
export interface IpaChartSound {
  symbol: string;
  example: string;
  type: "monophthong" | "diphthong" | "consonant";
}
