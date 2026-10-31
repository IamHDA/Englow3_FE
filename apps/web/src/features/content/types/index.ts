import type { ContentReviewFieldsFragment } from "@/lib/graphql/generated/documents";

/**
 * Một mục nội dung như người soạn và người duyệt nhìn thấy. Lấy từ codegen chứ
 * không tự khai lại - đây là shape *chỉ* dành cho khu quản trị: nó mang lý do
 * bị trả lại, thứ mà người học không bao giờ được đọc.
 */
export type ContentReviewItem = ContentReviewFieldsFragment;
