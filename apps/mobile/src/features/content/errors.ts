/** Backend refusals for content review, as the web's constants/adminContent.ts words them. */
export const CONTENT_ERRORS: Record<string, string> = {
  REVIEW_NOTE_REQUIRED: "Phải ghi rõ lý do khi trả lại.",
  FLASHCARD_SET_EMPTY: "Bộ thẻ chưa có thẻ nào.",
  FLASHCARD_SET_NOT_DRAFT:
    "Bộ thẻ này không còn là bản nháp nên không phát hành hay nhập thêm được.",
  FLASHCARD_SET_NOT_EDITABLE:
    "Bộ thẻ đang chờ duyệt hoặc đã lưu trữ nên không thêm thẻ được.",
  FLASHCARD_SET_LIVE_ADMIN_ONLY:
    "Bộ thẻ đã phát hành - chỉ quản trị viên được thêm thẻ.",
  FLASHCARD_SET_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được bộ thẻ đang là bản nháp hoặc bị trả lại.",
  FLASHCARD_SET_NOT_PENDING_REVIEW:
    "Bộ thẻ này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  FLASHCARD_SET_ALREADY_ARCHIVED: "Bộ thẻ này đã được lưu trữ từ trước.",
  FLASHCARD_SET_NOT_ARCHIVED: "Chỉ khôi phục được bộ thẻ đã lưu trữ.",
  QUIZ_EMPTY: "Bài trắc nghiệm chưa có câu hỏi nào.",
  QUIZ_ZERO_POINTS:
    "Mọi câu hỏi đều 0 điểm nên không chấm được. Gán điểm rồi thử lại.",
  QUIZ_NOT_DRAFT: "Chỉ phát hành được bài đang là bản nháp.",
  QUIZ_NOT_EDITABLE: "Chỉ sửa được bài đang là bản nháp hoặc bị trả lại.",
  QUIZ_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được bài đang là bản nháp hoặc bị trả lại.",
  QUIZ_NOT_PENDING_REVIEW:
    "Bài này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  QUIZ_ALREADY_ARCHIVED: "Bài này đã được lưu trữ từ trước.",
  QUIZ_NOT_ARCHIVED: "Chỉ khôi phục được bài đã lưu trữ.",
  DICTATION_LESSON_EMPTY: "Bài nghe chép chưa có câu nào.",
  DICTATION_LESSON_NOT_DRAFT: "Chỉ phát hành được bài đang là bản nháp.",
  DICTATION_LESSON_NOT_EDITABLE:
    "Bài đang chờ duyệt hoặc đã lưu trữ nên không thêm câu được.",
  DICTATION_LESSON_LIVE_ADMIN_ONLY:
    "Bài đã phát hành - chỉ quản trị viên được thêm câu.",
  DICTATION_LESSON_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được bài đang là bản nháp hoặc bị trả lại.",
  DICTATION_LESSON_NOT_PENDING_REVIEW:
    "Bài này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  DICTATION_LESSON_ALREADY_ARCHIVED: "Bài này đã được lưu trữ từ trước.",
  DICTATION_LESSON_NOT_ARCHIVED: "Chỉ khôi phục được bài đã lưu trữ.",
  SPEAKING_PROMPT_NO_REFERENCE_TEXT:
    "Câu luyện nói phải có câu mẫu để người học đọc theo.",
  SPEAKING_PROMPT_NOT_DRAFT: "Chỉ phát hành được câu đang là bản nháp.",
  SPEAKING_PROMPT_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được câu đang là bản nháp hoặc bị trả lại.",
  SPEAKING_PROMPT_NOT_PENDING_REVIEW:
    "Câu này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  SPEAKING_PROMPT_ALREADY_ARCHIVED: "Câu này đã được lưu trữ từ trước.",
  SPEAKING_PROMPT_NOT_ARCHIVED: "Chỉ khôi phục được câu đã lưu trữ.",
  TRANSLATION_SET_EMPTY: "Bộ câu luyện dịch chưa có câu nào.",
  TRANSLATION_SET_NOT_DRAFT: "Chỉ phát hành được bộ câu đang là bản nháp.",
  TRANSLATION_SET_NOT_SUBMITTABLE:
    "Chỉ gửi duyệt được bộ câu đang là bản nháp hoặc bị trả lại.",
  TRANSLATION_SET_NOT_PENDING_REVIEW:
    "Bộ câu này không còn chờ duyệt - có thể ai đó vừa xử lý.",
  TRANSLATION_SET_ALREADY_ARCHIVED: "Bộ câu này đã được lưu trữ từ trước.",
  TRANSLATION_SET_NOT_ARCHIVED: "Chỉ khôi phục được bộ câu đã lưu trữ.",
};
