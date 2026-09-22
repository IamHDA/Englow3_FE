/** Nhịp hỏi lại khi còn lượt đang chờ. Trả lời thường mất vài giây. */
export const POLL_INTERVAL_MS = 1500;

/**
 * Ngừng hỏi sau chừng này. Hàng đợi ở backend vẫn thử lại tiếp, nên đây chỉ là
 * lúc màn hình thôi quay và nói thẳng - không phải lúc câu hỏi bị huỷ.
 */
export const POLL_TIMEOUT_MS = 90_000;

/** Khớp với giới hạn của BFF và backend, để lỗi hiện ngay khi gõ. */
export const MAX_MESSAGE_LENGTH = 4_000;

/** Gợi ý mở đầu cho người chưa biết hỏi gì. */
export const TUTOR_STARTERS = [
  "Phân biệt 'make' và 'do' giúp mình.",
  "Sửa câu này: He don't like coffee.",
  "Khi nào dùng thì hiện tại hoàn thành?",
  "Đóng vai lễ tân khách sạn để mình luyện hội thoại.",
] as const;
