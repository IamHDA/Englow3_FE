/** Backend refusals for exam review, as the web's constants/adminExams.ts words them. */
export const EXAM_ADMIN_ERRORS: Record<string, string> = {
  FULL_TEST_COMPONENT_IN_USE:
    "Đề đang thuộc full test chờ duyệt, đã phát hành hoặc còn người đang thi. Lưu trữ full test và chờ các lượt thi kết thúc trước.",
  EXAM_NOT_DRAFT: "Chỉ phát hành được đề đang ở trạng thái bản nháp.",
  EXAM_NOT_EDITABLE: "Chỉ sửa được đề đang là bản nháp hoặc bị trả lại.",
  STORAGE_UNAVAILABLE: "Kho lưu trữ tệp đang lỗi. Thử tải lên lại sau ít phút.",
  EXAM_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được đề đang là bản nháp hoặc bị trả lại.",
  EXAM_NOT_PENDING_REVIEW:
    "Đề này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  EXAM_REVIEW_NOTE_REQUIRED: "Phải ghi rõ lý do khi trả lại đề.",
  EXAM_PRODUCTIVE_SECTION:
    "Đề có phần Writing/Speaking nên không phát hành được: đề thi thử chỉ chấm trắc nghiệm. Soạn Writing/Speaking ở mục Writing & Speaking.",
  EXAM_SCORE_MISMATCH:
    "Tổng điểm các phần không khớp thang điểm tối đa của đề. Sửa lại rồi phát hành.",
  EXAM_EMPTY: "Đề chưa có phần hoặc câu hỏi nào.",
  EXAM_HAS_NO_SECTION: "Đề chưa có phần nào.",
  EXAM_HAS_NO_QUESTION: "Đề chưa có câu hỏi nào.",
  EXAM_UNGRADEABLE_QUESTION:
    "Có câu hỏi chưa chấm được (thiếu đáp án đúng hoặc thiếu điểm).",
  EXAM_ALREADY_ARCHIVED: "Đề này đã được lưu trữ từ trước.",
  EXAM_NOT_ARCHIVED: "Chỉ khôi phục được đề đã lưu trữ.",
};
