/**
 * The words of the blog feature: /blog, writing and editing a post, a post's
 * comments, likes and reports, the posts on a wall, and the moderation screens
 * under /admin/blog.
 *
 * `{name}`, `{count}`, `{max}` and `{min}` are replaced by the caller. Beyond
 * that the feature never builds a sentence out of pieces, so a language is free
 * to word each one its own way.
 */

/**
 * The codes the backend's blog module refuses with (`extensions.backendCode`),
 * plus the few shared ones a blog call can meet. A code that is not here gets
 * `genericError`.
 */
export type BlogBackendCode =
  | "BLOG_POST_NOT_FOUND"
  | "BLOG_COMMENT_NOT_FOUND"
  | "BLOG_TARGET_NOT_FOUND"
  | "BLOG_TARGET_TYPE_INVALID"
  | "BLOG_TITLE_INVALID"
  | "BLOG_BODY_INVALID"
  | "BLOG_TOO_MANY_TAGS"
  | "BLOG_TAG_INVALID"
  | "BLOG_TOO_MANY_IMAGES"
  | "BLOG_IMAGE_NOT_UPLOADED"
  | "BLOG_IMAGE_INVALID"
  | "BLOG_IMAGE_TYPE_NOT_ALLOWED"
  | "BLOG_IMAGE_TOO_LARGE"
  | "BLOG_POST_STALE"
  | "BLOG_POST_NOT_AUTHOR"
  | "BLOG_POST_NOT_EDITABLE"
  | "BLOG_POST_NOT_OPEN"
  | "BLOG_COMMENT_INVALID"
  | "BLOG_COMMENT_NOT_AUTHOR"
  | "BLOG_COMMENT_NOT_EDITABLE"
  | "BLOG_INTERACTION_NOT_ALLOWED"
  | "BLOG_REPORT_OWN_CONTENT"
  | "BLOG_REPORT_CLOSED"
  | "BLOG_REPORT_DETAIL_TOO_LONG"
  | "BLOG_MODERATION_INVALID_TRANSITION"
  | "BLOG_NO_OPEN_REPORTS"
  | "BLOG_MODERATION_OWN_CONTENT"
  | "BLOG_MODERATION_REASON_INVALID"
  | "SEARCH_TERM_TOO_SHORT"
  | "RATE_LIMITED"
  | "VALIDATION_FAILED"
  | "ACCESS_DENIED";

type ConfirmCopy = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
};

export interface BlogTranslations {
  /** The header link and the page's heading. */
  title: string;
  /** What the not-found page says is missing. */
  thing: string;
  /** For a thing a person cannot open, without saying why (a block is never revealed). */
  notFoundDescription: string;
  backToList: string;
  /** A sentence for a backend refusal, by the backend's own code. */
  backendErrors: Record<BlogBackendCode, string>;
  /** For a code nobody wrote a sentence for, and for a failure with no code. */
  genericError: string;
  actionErrorTitle: string;
  /** The words of a post's tags, by the catalogue's value. A value not listed shows as it is. */
  tags: {
    kinds: { skill: string; level: string; certificate: string };
    values: Record<string, string>;
  };
  reportReasons: {
    spam: string;
    harassment: string;
    inappropriate: string;
    misinformation: string;
    other: string;
  };
  /** A post or a comment the viewer wrote that moderation acted on. */
  status: {
    postHidden: string;
    postRemoved: string;
    commentHidden: string;
    commentRemoved: string;
  };
  deletedAuthor: string;
  /**
   * When the viewer's own account did not load: what is theirs and what is
   * somebody else's cannot be told, so the controls that depend on it are left
   * out and this says so.
   */
  viewer: {
    errorTitle: string;
    errorDescription: string;
    retry: string;
  };
  list: {
    subtitle: string;
    write: string;
    search: {
      label: string;
      placeholder: string;
      tooShort: string;
    };
    filters: {
      skill: string;
      level: string;
      certificate: string;
      any: string;
      sort: string;
      newest: string;
      mostLiked: string;
      clear: string;
    };
    emptyTitle: string;
    emptyDescription: string;
    loadErrorTitle: string;
    loadErrorDescription: string;
    retry: string;
    catalogueError: string;
  };
  card: {
    edited: string;
    likesOne: string;
    likesOther: string;
    commentsOne: string;
    commentsOther: string;
    open: string;
  };
  post: {
    edited: string;
    edit: string;
    delete: string;
    report: string;
    reported: string;
    like: string;
    unlike: string;
    likesOne: string;
    likesOther: string;
    commentsOne: string;
    commentsOther: string;
    interactionClosed: string;
    authorBannerHidden: string;
    authorBannerRemoved: string;
    authorBannerNote: string;
    deleted: string;
    confirmDelete: ConfirmCopy;
    images: string;
  };
  comments: {
    title: string;
    empty: string;
    loadErrorTitle: string;
    loadErrorDescription: string;
    retry: string;
    edited: string;
    edit: string;
    delete: string;
    report: string;
    form: {
      label: string;
      placeholder: string;
      submit: string;
      editSubmit: string;
      cancel: string;
      required: string;
      tooLong: string;
      counter: string;
    };
    confirmDelete: ConfirmCopy;
    deleted: string;
  };
  report: {
    titlePost: string;
    titleComment: string;
    description: string;
    reasonLabel: string;
    reasonRequired: string;
    detailLabel: string;
    detailPlaceholder: string;
    detailTooLong: string;
    submit: string;
    cancel: string;
    thanksTitle: string;
    thanks: string;
  };
  editor: {
    titleNew: string;
    titleEdit: string;
    postTitle: {
      label: string;
      placeholder: string;
      required: string;
      tooLong: string;
    };
    body: {
      label: string;
      placeholder: string;
      required: string;
      tooLong: string;
      tabWrite: string;
      tabPreview: string;
      previewEmpty: string;
      counter: string;
      help: string;
    };
    tags: {
      label: string;
      description: string;
      tooMany: string;
      counter: string;
      placeholder: string;
    };
    images: {
      insert: string;
      uploading: string;
      count: string;
      tooMany: string;
      type: string;
      size: string;
      empty: string;
      altDefault: string;
      uploadFailed: string;
    };
    save: string;
    saveNew: string;
    saving: string;
    cancel: string;
    savedNew: string;
    savedEdit: string;
    /** Says what reloading does to the edits, since it replaces them. */
    stale: string;
    staleReload: string;
    /** Asked before a reload throws unsaved edits away. */
    reloadConfirm: ConfirmCopy;
    cannotEditTitle: string;
    cannotEditDescription: string;
    leave: ConfirmCopy;
  };
  wall: {
    title: string;
    write: string;
    emptyTitle: string;
    emptyDescriptionOwn: string;
    emptyDescriptionOther: string;
    loadErrorTitle: string;
    loadErrorDescription: string;
    retry: string;
  };
  admin: {
    /** The label of the entry in the administration menu. */
    menu: string;
    queue: {
      title: string;
      subtitle: string;
      tabs: { all: string; post: string; comment: string };
      sort: { label: string; oldest: string; mostReported: string };
      historyLink: string;
      emptyTitle: string;
      emptyDescription: string;
      loadErrorTitle: string;
      loadErrorDescription: string;
      retry: string;
      typePost: string;
      typeComment: string;
      openReportsOne: string;
      openReportsOther: string;
      firstReported: string;
      lastReported: string;
      deletedByAuthor: string;
      noExcerpt: string;
      commentOn: string;
    };
    target: {
      title: string;
      back: string;
      thing: string;
      content: string;
      contentGone: string;
      commentOn: string;
      reports: string;
      noReports: string;
      history: string;
      noHistory: string;
      reportedBy: string;
      note: string;
      resolution: string;
      resolvedOn: string;
      moderator: string;
      openReportsOne: string;
      openReportsOther: string;
      ownContent: string;
      deletedNotice: string;
      status: Record<
        "published" | "visible" | "hidden" | "removed" | "deleted",
        string
      >;
      reportStatus: Record<"open" | "resolved" | "dismissed", string>;
    };
    form: {
      title: string;
      actionLabel: string;
      actionRequired: string;
      reasonLabel: string;
      reasonPlaceholder: string;
      reasonRequired: string;
      reasonTooLong: string;
      submit: string;
      noActions: string;
      done: string;
      actions: Record<"hide" | "restore" | "remove" | "dismiss", string>;
      actionHelp: Record<"hide" | "restore" | "remove" | "dismiss", string>;
      confirmRemove: ConfirmCopy;
    };
    actions: {
      title: string;
      subtitle: string;
      back: string;
      emptyTitle: string;
      emptyDescription: string;
      loadErrorTitle: string;
      loadErrorDescription: string;
      retry: string;
      on: string;
      by: string;
      reason: string;
      open: string;
    };
  };
}

export const blogVi: BlogTranslations = {
  title: "Blog",
  thing: "bài viết",
  notFoundDescription:
    "Bài viết này không tồn tại hoặc bạn không xem được. Hãy quay lại danh sách bài viết.",
  backToList: "Về danh sách bài viết",
  backendErrors: {
    BLOG_POST_NOT_FOUND: "Không tìm thấy bài viết.",
    BLOG_COMMENT_NOT_FOUND: "Không tìm thấy bình luận.",
    BLOG_TARGET_NOT_FOUND: "Không tìm thấy nội dung này.",
    BLOG_TARGET_TYPE_INVALID: "Loại nội dung không hợp lệ.",
    BLOG_TITLE_INVALID: "Tiêu đề cần từ 1 đến 200 ký tự.",
    BLOG_BODY_INVALID: "Nội dung cần từ 1 đến 20 000 ký tự.",
    BLOG_TOO_MANY_TAGS: "Một bài viết chỉ có tối đa 8 thẻ.",
    BLOG_TAG_INVALID: "Có thẻ không hợp lệ. Hãy chọn lại thẻ.",
    BLOG_TOO_MANY_IMAGES: "Một bài viết chỉ có tối đa 10 ảnh.",
    BLOG_IMAGE_NOT_UPLOADED:
      "Ảnh chưa tải lên xong. Hãy đợi ảnh tải xong rồi lưu lại.",
    BLOG_IMAGE_INVALID: "Có ảnh không hợp lệ trong bài.",
    BLOG_IMAGE_TYPE_NOT_ALLOWED: "Chỉ nhận ảnh JPEG, PNG hoặc WebP.",
    BLOG_IMAGE_TOO_LARGE: "Ảnh quá lớn. Mỗi ảnh tối đa 5 MB.",
    BLOG_POST_STALE:
      "Bài đã thay đổi từ lúc bạn mở. Hãy tải lại để xem bản mới.",
    BLOG_POST_NOT_AUTHOR: "Chỉ tác giả mới làm được điều này.",
    BLOG_POST_NOT_EDITABLE: "Bài đã bị ẩn hoặc gỡ nên không sửa được.",
    BLOG_POST_NOT_OPEN: "Bài này không còn nhận báo cáo.",
    BLOG_COMMENT_INVALID: "Bình luận cần từ 1 đến 2000 ký tự.",
    BLOG_COMMENT_NOT_AUTHOR: "Chỉ người viết mới sửa hoặc xóa được bình luận.",
    BLOG_COMMENT_NOT_EDITABLE: "Bình luận đã bị ẩn hoặc gỡ nên không sửa được.",
    BLOG_INTERACTION_NOT_ALLOWED: "Bạn không thể bình luận ở bài này.",
    BLOG_REPORT_OWN_CONTENT: "Bạn không thể báo cáo nội dung của chính mình.",
    BLOG_REPORT_CLOSED: "Báo cáo này đã được xử lý.",
    BLOG_REPORT_DETAIL_TOO_LONG: "Ghi chú tối đa 500 ký tự.",
    BLOG_MODERATION_INVALID_TRANSITION:
      "Nội dung đang ở trạng thái khác, không thực hiện được thao tác này. Hãy tải lại trang.",
    BLOG_NO_OPEN_REPORTS:
      "Không còn báo cáo nào đang mở để bỏ qua. Hãy tải lại trang.",
    BLOG_MODERATION_OWN_CONTENT:
      "Bạn không thể tự kiểm duyệt nội dung của mình - cần một thành viên khác xử lý.",
    BLOG_MODERATION_REASON_INVALID: "Lý do cần từ 1 đến 500 ký tự.",
    SEARCH_TERM_TOO_SHORT: "Nhập ít nhất {min} ký tự để tìm.",
    RATE_LIMITED: "Bạn thao tác hơi nhanh. Hãy thử lại sau vài phút.",
    VALIDATION_FAILED: "Có thông tin chưa hợp lệ. Hãy kiểm tra lại.",
    ACCESS_DENIED: "Bạn không có quyền làm điều này.",
  },
  genericError: "Có lỗi xảy ra. Hãy thử lại.",
  actionErrorTitle: "Chưa thực hiện được",
  tags: {
    kinds: { skill: "Kỹ năng", level: "Trình độ", certificate: "Chứng chỉ" },
    values: {
      LISTENING: "Nghe",
      SPEAKING: "Nói",
      READING: "Đọc",
      WRITING: "Viết",
      VOCABULARY: "Từ vựng",
      GRAMMAR: "Ngữ pháp",
    },
  },
  reportReasons: {
    spam: "Spam hoặc quảng cáo",
    harassment: "Quấy rối, lăng mạ",
    inappropriate: "Nội dung không phù hợp",
    misinformation: "Thông tin sai lệch",
    other: "Lý do khác",
  },
  status: {
    postHidden: "Đã bị ẩn",
    postRemoved: "Đã bị gỡ",
    commentHidden: "Bình luận này đã bị ẩn bởi đội ngũ kiểm duyệt",
    commentRemoved: "Bình luận này đã bị gỡ bởi đội ngũ kiểm duyệt",
  },
  deletedAuthor: "Người dùng đã xóa",
  viewer: {
    errorTitle: "Chưa xác định được tài khoản của bạn",
    errorDescription:
      "Chưa tải được thông tin tài khoản nên chưa biết đâu là nội dung của bạn. Các nút báo cáo, xóa và kiểm duyệt sẽ hiện khi tải được.",
    retry: "Thử lại",
  },
  list: {
    subtitle: "Chia sẻ kinh nghiệm và kiến thức học tiếng Anh cùng mọi người.",
    write: "Viết bài",
    search: {
      label: "Tìm theo tiêu đề",
      placeholder: "Tìm theo tiêu đề bài viết",
      tooShort: "Nhập ít nhất {min} ký tự để tìm.",
    },
    filters: {
      skill: "Kỹ năng",
      level: "Trình độ",
      certificate: "Chứng chỉ",
      any: "Tất cả",
      sort: "Sắp xếp",
      newest: "Mới nhất",
      mostLiked: "Nhiều thích nhất",
      clear: "Xóa bộ lọc",
    },
    emptyTitle: "Chưa có bài viết nào phù hợp",
    emptyDescription:
      "Thử đổi bộ lọc hoặc từ khóa, hoặc là người đầu tiên viết về chủ đề này.",
    loadErrorTitle: "Không tải được bài viết",
    loadErrorDescription: "Máy chủ chưa trả lời. Hãy thử lại sau ít phút.",
    retry: "Thử lại",
    catalogueError: "Chưa tải được danh sách thẻ để lọc.",
  },
  card: {
    edited: "đã sửa",
    likesOne: "{count} lượt thích",
    likesOther: "{count} lượt thích",
    commentsOne: "{count} bình luận",
    commentsOther: "{count} bình luận",
    open: "Đọc bài",
  },
  post: {
    edited: "đã sửa",
    edit: "Sửa bài",
    delete: "Xóa bài",
    report: "Báo cáo",
    reported: "Đã báo cáo",
    like: "Thích bài viết",
    unlike: "Bỏ thích bài viết",
    likesOne: "{count} lượt thích",
    likesOther: "{count} lượt thích",
    commentsOne: "{count} bình luận",
    commentsOther: "{count} bình luận",
    interactionClosed: "Bài này không còn nhận thích và bình luận.",
    authorBannerHidden:
      "Bài của bạn đã bị ẩn bởi đội ngũ kiểm duyệt. Chỉ mình bạn xem được bài này.",
    authorBannerRemoved:
      "Bài của bạn đã bị gỡ bởi đội ngũ kiểm duyệt và không khôi phục được. Chỉ mình bạn xem được bài này.",
    authorBannerNote: "Lý do",
    deleted: "Đã xóa bài viết.",
    confirmDelete: {
      title: "Xóa bài viết này?",
      body: "Bài viết, các bình luận và ảnh của nó sẽ bị xóa và không khôi phục được.",
      confirmLabel: "Xóa bài",
      cancelLabel: "Giữ lại",
    },
    images: "Ảnh trong bài viết",
  },
  comments: {
    title: "Bình luận",
    empty: "Chưa có bình luận nào. Hãy là người đầu tiên.",
    loadErrorTitle: "Không tải được bình luận",
    loadErrorDescription: "Máy chủ chưa trả lời. Hãy thử lại sau ít phút.",
    retry: "Thử lại",
    edited: "đã sửa",
    edit: "Sửa",
    delete: "Xóa",
    report: "Báo cáo",
    form: {
      label: "Bình luận của bạn",
      placeholder: "Viết bình luận...",
      submit: "Gửi bình luận",
      editSubmit: "Lưu",
      cancel: "Hủy",
      required: "Hãy viết nội dung bình luận.",
      tooLong: "Bình luận tối đa {max} ký tự.",
      counter: "{count}/{max}",
    },
    confirmDelete: {
      title: "Xóa bình luận này?",
      body: "Bình luận sẽ bị xóa và không khôi phục được.",
      confirmLabel: "Xóa bình luận",
      cancelLabel: "Giữ lại",
    },
    deleted: "Đã xóa bình luận.",
  },
  report: {
    titlePost: "Báo cáo bài viết",
    titleComment: "Báo cáo bình luận",
    description:
      "Cho chúng tôi biết nội dung này có vấn đề gì. Đội ngũ kiểm duyệt sẽ xem xét; người viết không biết ai đã báo cáo.",
    reasonLabel: "Lý do",
    reasonRequired: "Hãy chọn một lý do.",
    detailLabel: "Ghi chú thêm (không bắt buộc)",
    detailPlaceholder: "Mô tả ngắn gọn để chúng tôi dễ xem xét",
    detailTooLong: "Ghi chú tối đa {max} ký tự.",
    submit: "Gửi báo cáo",
    cancel: "Hủy",
    thanksTitle: "Đã gửi báo cáo",
    thanks: "Cảm ơn bạn, chúng tôi sẽ xem xét.",
  },
  editor: {
    titleNew: "Viết bài mới",
    titleEdit: "Sửa bài viết",
    postTitle: {
      label: "Tiêu đề",
      placeholder: "Tiêu đề bài viết",
      required: "Hãy nhập tiêu đề.",
      tooLong: "Tiêu đề tối đa {max} ký tự.",
    },
    body: {
      label: "Nội dung",
      placeholder: "Viết nội dung bằng Markdown...",
      required: "Hãy viết nội dung bài.",
      tooLong: "Nội dung tối đa {max} ký tự.",
      tabWrite: "Soạn",
      tabPreview: "Xem trước",
      previewEmpty: "Chưa có nội dung để xem trước.",
      counter: "{count}/{max}",
      help: 'Hỗ trợ Markdown: **đậm**, *nghiêng*, danh sách, liên kết https, bảng. Ảnh chỉ hiện khi tải lên bằng nút "Chèn ảnh".',
    },
    tags: {
      label: "Thẻ",
      description: "Chọn tối đa {max} thẻ để người khác dễ tìm bài của bạn.",
      tooMany: "Một bài chỉ có tối đa {max} thẻ.",
      counter: "{count}/{max} thẻ",
      placeholder: "Chọn thẻ",
    },
    images: {
      insert: "Chèn ảnh",
      uploading: "Đang tải ảnh lên...",
      count: "{count}/{max} ảnh",
      tooMany: "Một bài chỉ có tối đa {max} ảnh.",
      type: "Chỉ nhận ảnh JPEG, PNG hoặc WebP.",
      size: "Ảnh quá lớn. Mỗi ảnh tối đa {max} MB.",
      empty: "Tệp ảnh trống.",
      altDefault: "mô tả ảnh",
      uploadFailed: "Chưa tải được ảnh lên. Hãy thử lại.",
    },
    save: "Lưu thay đổi",
    saveNew: "Đăng bài",
    saving: "Đang lưu...",
    cancel: "Hủy",
    savedNew: "Đã đăng bài.",
    savedEdit: "Đã lưu bài viết.",
    stale:
      "Bài đã thay đổi từ lúc bạn mở. Tải lại để xem bản mới - phần bạn đang sửa sẽ bị thay bằng bản mới.",
    staleReload: "Tải lại bài",
    reloadConfirm: {
      title: "Thay phần đang sửa bằng bản mới?",
      body: "Tải lại sẽ bỏ những gì bạn đã sửa và hiện bản mới nhất của bài.",
      confirmLabel: "Tải lại, bỏ bản đang sửa",
      cancelLabel: "Giữ bản đang sửa",
    },
    cannotEditTitle: "Bạn không thể sửa bài này",
    cannotEditDescription:
      "Chỉ tác giả sửa được bài, và bài đã bị ẩn hoặc gỡ thì không sửa được.",
    leave: {
      title: "Rời trang này?",
      body: "Bài viết chưa lưu sẽ mất nếu bạn rời đi.",
      confirmLabel: "Rời đi",
      cancelLabel: "Ở lại soạn tiếp",
    },
  },
  wall: {
    title: "Bài viết",
    write: "Viết bài",
    emptyTitle: "Chưa có bài viết nào",
    emptyDescriptionOwn: "Chia sẻ điều bạn đã học được với mọi người.",
    emptyDescriptionOther: "Thành viên này chưa đăng bài viết nào.",
    loadErrorTitle: "Không tải được bài viết",
    loadErrorDescription: "Máy chủ chưa trả lời. Hãy thử lại sau ít phút.",
    retry: "Thử lại",
  },
  admin: {
    menu: "Kiểm duyệt blog",
    queue: {
      title: "Kiểm duyệt blog",
      subtitle: "Nội dung đang có báo cáo chờ xem xét.",
      tabs: { all: "Tất cả", post: "Bài viết", comment: "Bình luận" },
      sort: {
        label: "Sắp xếp",
        oldest: "Báo cáo lâu nhất",
        mostReported: "Nhiều báo cáo nhất",
      },
      historyLink: "Lịch sử xử lý",
      emptyTitle: "Không có nội dung nào cần xem xét",
      emptyDescription:
        "Khi có người báo cáo bài viết hoặc bình luận, nội dung sẽ hiện ở đây.",
      loadErrorTitle: "Không tải được hàng đợi",
      loadErrorDescription: "Máy chủ chưa trả lời. Hãy thử lại sau ít phút.",
      retry: "Thử lại",
      typePost: "Bài viết",
      typeComment: "Bình luận",
      openReportsOne: "{count} báo cáo đang mở",
      openReportsOther: "{count} báo cáo đang mở",
      firstReported: "Báo cáo đầu",
      lastReported: "Báo cáo gần nhất",
      deletedByAuthor: "Nội dung đã bị tác giả xóa",
      noExcerpt: "(không có trích đoạn)",
      commentOn: "Trong bài",
    },
    target: {
      title: "Chi tiết nội dung",
      back: "Về hàng đợi",
      thing: "nội dung",
      content: "Nội dung",
      contentGone:
        "Nội dung đã bị tác giả xóa. Báo cáo và lịch sử xử lý vẫn còn.",
      commentOn: "Bình luận trong bài",
      reports: "Báo cáo",
      noReports: "Chưa có báo cáo nào.",
      history: "Lịch sử xử lý",
      noHistory: "Chưa có thao tác nào.",
      reportedBy: "Người báo cáo",
      note: "Ghi chú",
      resolution: "Kết quả",
      resolvedOn: "Đóng lúc",
      moderator: "Người xử lý",
      openReportsOne: "{count} báo cáo đang mở",
      openReportsOther: "{count} báo cáo đang mở",
      ownContent:
        "Bạn không thể tự kiểm duyệt nội dung của mình - cần một thành viên khác xử lý.",
      deletedNotice: "Nội dung đã bị tác giả xóa.",
      status: {
        published: "Đang hiển thị",
        visible: "Đang hiển thị",
        hidden: "Đã ẩn",
        removed: "Đã gỡ",
        deleted: "Đã bị tác giả xóa",
      },
      reportStatus: {
        open: "Đang mở",
        resolved: "Đã xử lý",
        dismissed: "Đã bỏ qua",
      },
    },
    form: {
      title: "Xử lý nội dung",
      actionLabel: "Hành động",
      actionRequired: "Hãy chọn một hành động.",
      reasonLabel:
        "Lý do (được lưu vào lịch sử; tác giả bài viết thấy lý do khi bài bị ẩn hoặc gỡ)",
      reasonPlaceholder: "Ghi rõ lý do của quyết định",
      reasonRequired: "Hãy nhập lý do.",
      reasonTooLong: "Lý do tối đa {max} ký tự.",
      submit: "Thực hiện",
      noActions: "Không có thao tác nào áp dụng cho nội dung ở trạng thái này.",
      done: "Đã xử lý.",
      actions: {
        hide: "Ẩn",
        restore: "Khôi phục",
        remove: "Gỡ",
        dismiss: "Bỏ qua báo cáo",
      },
      actionHelp: {
        hide: "Ẩn nội dung, có thể khôi phục sau. Các báo cáo đang mở được đóng.",
        restore: "Hiện lại nội dung đang bị ẩn.",
        remove: "Gỡ vĩnh viễn: không khôi phục được.",
        dismiss: "Giữ nguyên nội dung và đóng các báo cáo đang mở.",
      },
      confirmRemove: {
        title: "Gỡ nội dung này?",
        body: "Gỡ là vĩnh viễn: nội dung không khôi phục được. Hãy chắc chắn trước khi tiếp tục.",
        confirmLabel: "Gỡ vĩnh viễn",
        cancelLabel: "Quay lại",
      },
    },
    actions: {
      title: "Lịch sử xử lý",
      subtitle: "Những gì đội ngũ kiểm duyệt đã làm gần đây, mới nhất ở trên.",
      back: "Về hàng đợi",
      emptyTitle: "Chưa có thao tác nào",
      emptyDescription:
        "Các thao tác ẩn, khôi phục, gỡ và bỏ qua báo cáo sẽ hiện ở đây.",
      loadErrorTitle: "Không tải được lịch sử",
      loadErrorDescription: "Máy chủ chưa trả lời. Hãy thử lại sau ít phút.",
      retry: "Thử lại",
      on: "Với",
      by: "Bởi",
      reason: "Lý do",
      open: "Mở nội dung",
    },
  },
};

export const blogEn: BlogTranslations = {
  title: "Blog",
  thing: "post",
  notFoundDescription:
    "This post does not exist, or you cannot view it. Go back to the posts.",
  backToList: "Back to posts",
  backendErrors: {
    BLOG_POST_NOT_FOUND: "That post was not found.",
    BLOG_COMMENT_NOT_FOUND: "That comment was not found.",
    BLOG_TARGET_NOT_FOUND: "That content was not found.",
    BLOG_TARGET_TYPE_INVALID: "That type of content is not valid.",
    BLOG_TITLE_INVALID: "The title needs 1 to 200 characters.",
    BLOG_BODY_INVALID: "The text needs 1 to 20,000 characters.",
    BLOG_TOO_MANY_TAGS: "A post has at most 8 tags.",
    BLOG_TAG_INVALID: "A tag is not valid. Choose the tags again.",
    BLOG_TOO_MANY_IMAGES: "A post has at most 10 images.",
    BLOG_IMAGE_NOT_UPLOADED:
      "An image has not finished uploading. Wait for it, then save again.",
    BLOG_IMAGE_INVALID: "There is an image in the post that is not valid.",
    BLOG_IMAGE_TYPE_NOT_ALLOWED: "Only JPEG, PNG or WebP images are accepted.",
    BLOG_IMAGE_TOO_LARGE:
      "That image is too large. Each image is 5 MB at most.",
    BLOG_POST_STALE:
      "The post changed since you opened it. Reload it to see the new version.",
    BLOG_POST_NOT_AUTHOR: "Only the author can do that.",
    BLOG_POST_NOT_EDITABLE: "A hidden or removed post cannot be edited.",
    BLOG_POST_NOT_OPEN: "This post no longer takes reports.",
    BLOG_COMMENT_INVALID: "A comment needs 1 to 2,000 characters.",
    BLOG_COMMENT_NOT_AUTHOR:
      "Only the person who wrote a comment can edit or delete it.",
    BLOG_COMMENT_NOT_EDITABLE: "A hidden or removed comment cannot be edited.",
    BLOG_INTERACTION_NOT_ALLOWED: "You cannot comment on this post.",
    BLOG_REPORT_OWN_CONTENT: "You cannot report your own content.",
    BLOG_REPORT_CLOSED: "That report has already been closed.",
    BLOG_REPORT_DETAIL_TOO_LONG: "The note is 500 characters at most.",
    BLOG_MODERATION_INVALID_TRANSITION:
      "The content is in a different state, so that cannot be done. Reload the page.",
    BLOG_NO_OPEN_REPORTS:
      "There are no open reports left to dismiss. Reload the page.",
    BLOG_MODERATION_OWN_CONTENT:
      "You cannot moderate your own content - another member has to handle it.",
    BLOG_MODERATION_REASON_INVALID: "The reason needs 1 to 500 characters.",
    SEARCH_TERM_TOO_SHORT: "Type at least {min} characters to search.",
    RATE_LIMITED: "You are going a little fast. Try again in a few minutes.",
    VALIDATION_FAILED: "Some details are not valid. Check them again.",
    ACCESS_DENIED: "You are not allowed to do that.",
  },
  genericError: "Something went wrong. Please try again.",
  actionErrorTitle: "Could not do that",
  tags: {
    kinds: { skill: "Skill", level: "Level", certificate: "Certificate" },
    values: {
      LISTENING: "Listening",
      SPEAKING: "Speaking",
      READING: "Reading",
      WRITING: "Writing",
      VOCABULARY: "Vocabulary",
      GRAMMAR: "Grammar",
    },
  },
  reportReasons: {
    spam: "Spam or advertising",
    harassment: "Harassment or abuse",
    inappropriate: "Inappropriate content",
    misinformation: "Misinformation",
    other: "Another reason",
  },
  status: {
    postHidden: "Hidden",
    postRemoved: "Removed",
    commentHidden: "This comment was hidden by the moderation team",
    commentRemoved: "This comment was removed by the moderation team",
  },
  deletedAuthor: "Deleted user",
  viewer: {
    errorTitle: "Could not tell who you are",
    errorDescription:
      "Your account could not be loaded, so what is yours and what is somebody else's cannot be told. The report, delete and moderation buttons come back once it loads.",
    retry: "Try again",
  },
  list: {
    subtitle:
      "Share what you know about learning English, and read what others share.",
    write: "Write a post",
    search: {
      label: "Search titles",
      placeholder: "Search post titles",
      tooShort: "Type at least {min} characters to search.",
    },
    filters: {
      skill: "Skill",
      level: "Level",
      certificate: "Certificate",
      any: "All",
      sort: "Sort by",
      newest: "Newest",
      mostLiked: "Most liked",
      clear: "Clear filters",
    },
    emptyTitle: "No posts match",
    emptyDescription:
      "Try other filters or words, or be the first to write about it.",
    loadErrorTitle: "Could not load the posts",
    loadErrorDescription: "The server did not answer. Try again in a moment.",
    retry: "Try again",
    catalogueError: "The tags to filter by could not be loaded.",
  },
  card: {
    edited: "edited",
    likesOne: "{count} like",
    likesOther: "{count} likes",
    commentsOne: "{count} comment",
    commentsOther: "{count} comments",
    open: "Read post",
  },
  post: {
    edited: "edited",
    edit: "Edit post",
    delete: "Delete post",
    report: "Report",
    reported: "Reported",
    like: "Like this post",
    unlike: "Unlike this post",
    likesOne: "{count} like",
    likesOther: "{count} likes",
    commentsOne: "{count} comment",
    commentsOther: "{count} comments",
    interactionClosed: "This post no longer takes likes or comments.",
    authorBannerHidden:
      "Your post was hidden by the moderation team. Only you can see it.",
    authorBannerRemoved:
      "Your post was removed by the moderation team and cannot be restored. Only you can see it.",
    authorBannerNote: "Reason",
    deleted: "Post deleted.",
    confirmDelete: {
      title: "Delete this post?",
      body: "The post, its comments and its images will be deleted and cannot be restored.",
      confirmLabel: "Delete post",
      cancelLabel: "Keep it",
    },
    images: "Images in this post",
  },
  comments: {
    title: "Comments",
    empty: "No comments yet. Be the first.",
    loadErrorTitle: "Could not load the comments",
    loadErrorDescription: "The server did not answer. Try again in a moment.",
    retry: "Try again",
    edited: "edited",
    edit: "Edit",
    delete: "Delete",
    report: "Report",
    form: {
      label: "Your comment",
      placeholder: "Write a comment...",
      submit: "Post comment",
      editSubmit: "Save",
      cancel: "Cancel",
      required: "Write something first.",
      tooLong: "A comment is {max} characters at most.",
      counter: "{count}/{max}",
    },
    confirmDelete: {
      title: "Delete this comment?",
      body: "The comment will be deleted and cannot be restored.",
      confirmLabel: "Delete comment",
      cancelLabel: "Keep it",
    },
    deleted: "Comment deleted.",
  },
  report: {
    titlePost: "Report this post",
    titleComment: "Report this comment",
    description:
      "Tell us what is wrong with it. The moderation team will look into it; the writer is not told who reported it.",
    reasonLabel: "Reason",
    reasonRequired: "Choose a reason.",
    detailLabel: "More detail (optional)",
    detailPlaceholder: "A short note helps us look into it",
    detailTooLong: "The note is {max} characters at most.",
    submit: "Send report",
    cancel: "Cancel",
    thanksTitle: "Report sent",
    thanks: "Thank you, we will look into it.",
  },
  editor: {
    titleNew: "Write a new post",
    titleEdit: "Edit post",
    postTitle: {
      label: "Title",
      placeholder: "Post title",
      required: "Enter a title.",
      tooLong: "The title is {max} characters at most.",
    },
    body: {
      label: "Text",
      placeholder: "Write in Markdown...",
      required: "Write the text of the post.",
      tooLong: "The text is {max} characters at most.",
      tabWrite: "Write",
      tabPreview: "Preview",
      previewEmpty: "There is nothing to preview yet.",
      counter: "{count}/{max}",
      help: 'Markdown is supported: **bold**, *italic*, lists, https links, tables. Images show only when added with the "Insert image" button.',
    },
    tags: {
      label: "Tags",
      description: "Choose up to {max} tags so others can find your post.",
      tooMany: "A post has at most {max} tags.",
      counter: "{count}/{max} tags",
      placeholder: "Choose tags",
    },
    images: {
      insert: "Insert image",
      uploading: "Uploading image...",
      count: "{count}/{max} images",
      tooMany: "A post has at most {max} images.",
      type: "Only JPEG, PNG or WebP images are accepted.",
      size: "That image is too large. Each image is {max} MB at most.",
      empty: "That image file is empty.",
      altDefault: "image description",
      uploadFailed: "The image could not be uploaded. Try again.",
    },
    save: "Save changes",
    saveNew: "Publish",
    saving: "Saving...",
    cancel: "Cancel",
    savedNew: "Post published.",
    savedEdit: "Post saved.",
    stale:
      "The post changed since you opened it. Reloading shows the new version and replaces what you are editing.",
    staleReload: "Reload the post",
    reloadConfirm: {
      title: "Replace your edits with the new version?",
      body: "Reloading discards what you have changed and shows the latest version of the post.",
      confirmLabel: "Reload and discard my edits",
      cancelLabel: "Keep my edits",
    },
    cannotEditTitle: "You cannot edit this post",
    cannotEditDescription:
      "Only the author can edit a post, and a hidden or removed post cannot be edited.",
    leave: {
      title: "Leave this page?",
      body: "The post you have not saved will be lost if you leave.",
      confirmLabel: "Leave",
      cancelLabel: "Keep writing",
    },
  },
  wall: {
    title: "Posts",
    write: "Write a post",
    emptyTitle: "No posts yet",
    emptyDescriptionOwn: "Share what you have learned with everyone.",
    emptyDescriptionOther: "This member has not posted anything yet.",
    loadErrorTitle: "Could not load the posts",
    loadErrorDescription: "The server did not answer. Try again in a moment.",
    retry: "Try again",
  },
  admin: {
    menu: "Blog moderation",
    queue: {
      title: "Blog moderation",
      subtitle: "Content with reports waiting to be looked at.",
      tabs: { all: "All", post: "Posts", comment: "Comments" },
      sort: {
        label: "Sort by",
        oldest: "Reported longest ago",
        mostReported: "Most reported",
      },
      historyLink: "Moderation history",
      emptyTitle: "Nothing to review",
      emptyDescription:
        "When someone reports a post or a comment it will show up here.",
      loadErrorTitle: "Could not load the queue",
      loadErrorDescription: "The server did not answer. Try again in a moment.",
      retry: "Try again",
      typePost: "Post",
      typeComment: "Comment",
      openReportsOne: "{count} open report",
      openReportsOther: "{count} open reports",
      firstReported: "First reported",
      lastReported: "Last reported",
      deletedByAuthor: "Content deleted by its author",
      noExcerpt: "(no excerpt)",
      commentOn: "On the post",
    },
    target: {
      title: "Content details",
      back: "Back to the queue",
      thing: "content",
      content: "Content",
      contentGone:
        "The author deleted this content. The reports and the history remain.",
      commentOn: "Comment on the post",
      reports: "Reports",
      noReports: "No reports yet.",
      history: "Moderation history",
      noHistory: "Nothing has been done yet.",
      reportedBy: "Reported by",
      note: "Note",
      resolution: "Outcome",
      resolvedOn: "Closed",
      moderator: "Handled by",
      openReportsOne: "{count} open report",
      openReportsOther: "{count} open reports",
      ownContent:
        "You cannot moderate your own content - another member has to handle it.",
      deletedNotice: "The author deleted this content.",
      status: {
        published: "Published",
        visible: "Visible",
        hidden: "Hidden",
        removed: "Removed",
        deleted: "Deleted by its author",
      },
      reportStatus: {
        open: "Open",
        resolved: "Resolved",
        dismissed: "Dismissed",
      },
    },
    form: {
      title: "Handle this content",
      actionLabel: "Action",
      actionRequired: "Choose an action.",
      reasonLabel:
        "Reason (kept in the history; a post's author sees it when the post is hidden or removed)",
      reasonPlaceholder: "State the reason for your decision",
      reasonRequired: "Enter a reason.",
      reasonTooLong: "The reason is {max} characters at most.",
      submit: "Apply",
      noActions: "No action applies to content in this state.",
      done: "Done.",
      actions: {
        hide: "Hide",
        restore: "Restore",
        remove: "Remove",
        dismiss: "Dismiss reports",
      },
      actionHelp: {
        hide: "Hide the content; it can be restored later. Open reports are closed.",
        restore: "Show hidden content again.",
        remove: "Remove for good: it cannot be restored.",
        dismiss: "Leave the content as it is and close its open reports.",
      },
      confirmRemove: {
        title: "Remove this content?",
        body: "Removing is permanent: the content cannot be restored. Be sure before you go on.",
        confirmLabel: "Remove for good",
        cancelLabel: "Go back",
      },
    },
    actions: {
      title: "Moderation history",
      subtitle: "What the moderation team did lately, newest first.",
      back: "Back to the queue",
      emptyTitle: "Nothing has been done yet",
      emptyDescription:
        "Hiding, restoring, removing and dismissing reports will show up here.",
      loadErrorTitle: "Could not load the history",
      loadErrorDescription: "The server did not answer. Try again in a moment.",
      retry: "Try again",
      on: "On",
      by: "By",
      reason: "Reason",
      open: "Open the content",
    },
  },
};
