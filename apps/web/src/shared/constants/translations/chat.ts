/**
 * The words of the chat feature: the conversation list, a conversation, the
 * composer, the header's new-message indicator and the "Message" button on a
 * friend's wall.
 *
 * `{name}`, `{count}` and `{max}` are replaced by the caller. A sentence that
 * differs by number has a `One` and an `Other`, since English does and a
 * "1 unread conversations" is a small mistake that is easy never to make.
 */

/**
 * The codes the backend's chat module refuses with (`extensions.backendCode`),
 * plus the rate limit every module shares. A code that is not here gets
 * `genericError`.
 */
export type ChatBackendCode =
  | "CHAT_NOT_FRIENDS"
  | "CHAT_PARTNER_GONE"
  | "CHAT_CONVERSATION_NOT_FOUND"
  | "CHAT_MESSAGE_ALREADY_RECALLED"
  | "CHAT_MESSAGE_NOT_FOUND"
  | "CHAT_MESSAGE_NOT_SENDER"
  | "CHAT_MESSAGE_EMPTY"
  | "CHAT_MESSAGE_TOO_LONG"
  | "CHAT_IMAGE_NOT_UPLOADED"
  | "CHAT_IMAGE_UPLOAD_NOT_FOUND"
  | "CHAT_IMAGE_TYPE_NOT_ALLOWED"
  | "CHAT_IMAGE_TOO_LARGE"
  | "CHAT_CLIENT_ID_REUSED"
  | "CHAT_LEARNERS_ONLY"
  | "CHAT_SELF"
  | "CHAT_HISTORY_CURSOR_CONFLICT"
  | "CHAT_READ_SEQ_INVALID"
  | "RATE_LIMITED";

export interface ChatTranslations {
  /** The header's icon button. */
  indicator: {
    /** No unread conversation. */
    label: string;
    unreadOne: string;
    unreadOther: string;
  };
  list: {
    heading: string;
    loadErrorTitle: string;
    loadErrorDescription: string;
    retry: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction: string;
    /** Instead of a name, for someone who erased their account. */
    deletedUser: string;
    /** Before the preview of the viewer's own last message. */
    youPrefix: string;
    imagePreview: string;
    recalledPreview: string;
    unreadOne: string;
    unreadOther: string;
  };
  pane: {
    /** Mobile: the way back from a conversation to the list. */
    backToList: string;
    viewProfile: string;
    placeholderTitle: string;
    placeholderDescription: string;
    /** What the not-found and load-error states say is missing: "Không tìm thấy cuộc trò chuyện". */
    thing: string;
    notFoundDescription: string;
    notFoundBack: string;
    emptyTitle: string;
    emptyDescription: string;
    loadingOlder: string;
    typing: string;
    seen: string;
    today: string;
    yesterday: string;
    messagesLabel: string;
  };
  message: {
    recalled: string;
    sending: string;
    failed: string;
    retry: string;
    dismiss: string;
    options: string;
    recall: string;
    recallTitle: string;
    recallBody: string;
    recallConfirm: string;
    recallCancel: string;
    imageAlt: string;
    openImage: string;
    recallFailedTitle: string;
  };
  composer: {
    label: string;
    placeholder: string;
    send: string;
    attach: string;
    removeImage: string;
    imagePreviewAlt: string;
    hint: string;
    tooLong: string;
    imageType: string;
    imageSize: string;
    imageEmpty: string;
    /** The box is replaced by this when the two are no longer friends. */
    lockedNotFriends: string;
    /** ... or when the other person erased their account. */
    lockedPartnerGone: string;
  };
  connection: {
    reconnecting: string;
    failed: string;
    /** The backend closed this socket because the chat is open in more places than it allows. */
    failedTooManyConnections: string;
    reload: string;
  };
  learnersOnly: {
    title: string;
    description: string;
    action: string;
  };
  openChat: {
    button: string;
    buttonFor: string;
    errorTitle: string;
  };
  backendErrors: Record<ChatBackendCode, string>;
  genericError: string;
}

export const chatVi: ChatTranslations = {
  indicator: {
    label: "Tin nhắn",
    unreadOne: "Tin nhắn, {count} cuộc trò chuyện chưa đọc",
    unreadOther: "Tin nhắn, {count} cuộc trò chuyện chưa đọc",
  },
  list: {
    heading: "Tin nhắn",
    loadErrorTitle: "Không tải được danh sách",
    loadErrorDescription: "Máy chủ chưa phản hồi. Thử lại sau ít phút.",
    retry: "Thử lại",
    emptyTitle: "Chưa có cuộc trò chuyện",
    emptyDescription:
      "Nhắn tin cho bạn bè từ trang cá nhân của họ. Cuộc trò chuyện sẽ hiện ở đây.",
    emptyAction: "Xem bạn bè",
    deletedUser: "Người dùng đã xóa",
    youPrefix: "Bạn: ",
    imagePreview: "Ảnh",
    recalledPreview: "Tin nhắn đã thu hồi",
    unreadOne: "{count} tin chưa đọc",
    unreadOther: "{count} tin chưa đọc",
  },
  pane: {
    backToList: "Quay lại danh sách tin nhắn",
    viewProfile: "Xem trang cá nhân của {name}",
    placeholderTitle: "Chọn một cuộc trò chuyện",
    placeholderDescription:
      "Chọn một người bạn ở danh sách bên trái để đọc và nhắn tin.",
    thing: "cuộc trò chuyện",
    notFoundDescription:
      "Cuộc trò chuyện này không tồn tại, hoặc không phải của bạn.",
    notFoundBack: "Về danh sách tin nhắn",
    emptyTitle: "Hãy nói xin chào",
    emptyDescription: "Chưa có tin nhắn nào. Gửi tin đầu tiên cho {name}.",
    loadingOlder: "Đang tải tin nhắn cũ hơn…",
    typing: "{name} đang gõ…",
    seen: "Đã xem",
    today: "Hôm nay",
    yesterday: "Hôm qua",
    messagesLabel: "Tin nhắn với {name}",
  },
  message: {
    recalled: "Tin nhắn đã thu hồi",
    sending: "Đang gửi…",
    failed: "Không gửi được",
    retry: "Gửi lại",
    dismiss: "Xóa",
    options: "Tùy chọn tin nhắn",
    recall: "Thu hồi",
    recallTitle: "Thu hồi tin nhắn?",
    recallBody: "Tin nhắn sẽ biến mất với cả hai người và không thể khôi phục.",
    recallConfirm: "Thu hồi",
    recallCancel: "Giữ lại",
    imageAlt: "Ảnh trong tin nhắn",
    openImage: "Mở ảnh trong tab mới",
    recallFailedTitle: "Không thu hồi được",
  },
  composer: {
    label: "Tin nhắn",
    placeholder: "Nhập tin nhắn…",
    send: "Gửi",
    attach: "Đính kèm ảnh",
    removeImage: "Bỏ ảnh",
    imagePreviewAlt: "Ảnh sắp gửi",
    hint: "Enter để gửi · Shift+Enter xuống dòng",
    tooLong: "Tin nhắn dài tối đa {max} ký tự.",
    imageType: "Chỉ gửi được ảnh JPEG, PNG hoặc WebP.",
    imageSize: "Ảnh tối đa {max} MB.",
    imageEmpty: "Tệp ảnh này trống.",
    lockedNotFriends:
      "Hai bạn không còn là bạn bè nên không nhắn tin được. Tin nhắn cũ vẫn xem được.",
    lockedPartnerGone:
      "Người dùng này đã xóa tài khoản nên không nhắn tin được. Tin nhắn cũ vẫn xem được.",
  },
  connection: {
    reconnecting: "Đang kết nối lại… Bạn vẫn gửi được tin nhắn.",
    failed: "Tin nhắn mới sẽ không tự hiện lên. Tải lại trang để kết nối lại.",
    failedTooManyConnections:
      "Tin nhắn đang mở ở quá nhiều tab hoặc thiết bị. Đóng bớt rồi tải lại trang để dùng ở đây.",
    reload: "Tải lại",
  },
  learnersOnly: {
    title: "Tin nhắn dành cho học viên",
    description:
      "Tài khoản quản trị không gửi hay nhận tin nhắn. Nhân viên không đọc tin nhắn riêng của học viên.",
    action: "Về trang quản trị",
  },
  openChat: {
    button: "Nhắn tin",
    buttonFor: "Nhắn tin cho {name}",
    errorTitle: "Không mở được cuộc trò chuyện",
  },
  backendErrors: {
    CHAT_NOT_FRIENDS: "Hai bạn không còn là bạn bè.",
    CHAT_PARTNER_GONE: "Người này đã xóa tài khoản.",
    CHAT_CONVERSATION_NOT_FOUND: "Không tìm thấy cuộc trò chuyện này.",
    CHAT_MESSAGE_ALREADY_RECALLED: "Tin nhắn này đã được thu hồi.",
    CHAT_MESSAGE_NOT_FOUND: "Không tìm thấy tin nhắn này.",
    CHAT_MESSAGE_NOT_SENDER: "Chỉ người gửi mới thu hồi được tin nhắn.",
    CHAT_MESSAGE_EMPTY: "Tin nhắn cần có chữ hoặc một ảnh.",
    CHAT_MESSAGE_TOO_LONG: "Tin nhắn quá dài.",
    CHAT_IMAGE_NOT_UPLOADED: "Ảnh chưa tải lên xong. Thử gửi lại.",
    CHAT_IMAGE_UPLOAD_NOT_FOUND: "Ảnh đã hết hạn. Hãy chọn lại ảnh.",
    CHAT_IMAGE_TYPE_NOT_ALLOWED: "Chỉ gửi được ảnh JPEG, PNG hoặc WebP.",
    CHAT_IMAGE_TOO_LARGE: "Ảnh quá lớn.",
    CHAT_CLIENT_ID_REUSED: "Tin nhắn này đã được dùng ở cuộc trò chuyện khác.",
    CHAT_LEARNERS_ONLY: "Tin nhắn dành cho học viên.",
    CHAT_SELF: "Bạn không thể nhắn tin cho chính mình.",
    CHAT_HISTORY_CURSOR_CONFLICT: "Không tải được tin nhắn. Thử lại.",
    CHAT_READ_SEQ_INVALID: "Không đánh dấu đã đọc được.",
    RATE_LIMITED: "Bạn thao tác quá nhanh. Thử lại sau ít phút.",
  },
  genericError: "Có lỗi xảy ra. Vui lòng thử lại.",
};
