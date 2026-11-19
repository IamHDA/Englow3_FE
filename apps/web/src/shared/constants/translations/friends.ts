/**
 * The words of the friends feature: /friends, the wall at /people/[userId],
 * the buttons on a person's row and the header badge.
 *
 * `{name}`, `{count}` and `{min}` are replaced by the caller. Beyond that the
 * feature never builds a sentence out of pieces, so a language is free to word
 * each one its own way.
 */

/**
 * The codes the backend's friendship module refuses with
 * (`extensions.backendCode`). A code that is not here gets `genericError`.
 */
export type FriendsBackendCode =
  | "FRIEND_REQUEST_NOT_ALLOWED"
  | "ALREADY_FRIENDS"
  | "SEARCH_TERM_TOO_SHORT"
  | "FRIENDSHIP_LEARNERS_ONLY"
  | "FRIENDSHIP_NOT_FOUND"
  | "FRIENDSHIP_NOT_ACCEPTED"
  | "FRIEND_REQUEST_NOT_FOUND"
  | "FRIEND_REQUEST_NOT_PENDING"
  | "FRIEND_REQUEST_NOT_ADDRESSEE"
  | "FRIENDSHIP_SELF"
  | "BLOCK_SELF"
  | "LEARNER_NOT_FOUND";

type ConfirmCopy = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
};

export interface FriendsTranslations {
  pageTitle: string;
  tabs: {
    friends: string;
    requests: string;
    search: string;
    blocked: string;
  };
  directions: {
    incoming: string;
    outgoing: string;
  };
  actions: {
    add: string;
    cancel: string;
    accept: string;
    decline: string;
    friends: string;
    unfriend: string;
    block: string;
    unblock: string;
    editProfile: string;
    friendsPage: string;
    /** The "..." button beside a person's main button. */
    moreFor: string;
    /** The menu button of a friend; its visible text stays "friends". */
    friendMenuFor: string;
  };
  /** What the toast says once an action went through. */
  success: {
    send: string;
    accept: string;
    decline: string;
    cancel: string;
    unfriend: string;
    block: string;
    unblock: string;
    /** Sending a request to someone who had already asked answers theirs instead. */
    nowFriends: string;
  };
  actionErrorTitle: string;
  confirm: {
    unfriend: ConfirmCopy;
    block: ConfirmCopy;
  };
  /** A sentence for a backend refusal, by the backend's own code. */
  backendErrors: Record<FriendsBackendCode, string>;
  /** For a code nobody wrote a sentence for, and for a failure with no code. */
  genericError: string;
  list: {
    loadErrorTitle: string;
    loadErrorDescription: string;
    retry: string;
    friendsEmptyTitle: string;
    friendsEmptyDescription: string;
    friendsEmptyAction: string;
    incomingEmptyTitle: string;
    incomingEmptyDescription: string;
    outgoingEmptyTitle: string;
    outgoingEmptyDescription: string;
    blockedEmptyTitle: string;
    blockedEmptyDescription: string;
    friendsSince: string;
    requestReceived: string;
    requestSent: string;
    blockedSince: string;
  };
  search: {
    label: string;
    placeholder: string;
    idleTitle: string;
    idleDescription: string;
    tooShort: string;
    emptyTitle: string;
    emptyDescription: string;
    loadErrorTitle: string;
  };
  learnersOnly: {
    title: string;
    description: string;
    action: string;
  };
  wall: {
    backLabel: string;
    /** Stands in for the name in a confirmation when the profile did not load. */
    fallbackName: string;
    /** What the not-found page says is missing: "Không tìm thấy người dùng". */
    thing: string;
    notFoundDescription: string;
    unavailableTitle: string;
    unavailableDescription: string;
    staffBadge: string;
    joined: string;
    friendCountOne: string;
    friendCountOther: string;
    profileErrorTitle: string;
    profileErrorDescription: string;
    retry: string;
  };
  requestBadge: {
    labelOne: string;
    labelOther: string;
  };
}

export const friendsVi: FriendsTranslations = {
  pageTitle: "Bạn bè",
  tabs: {
    friends: "Bạn bè",
    requests: "Lời mời",
    search: "Tìm bạn",
    blocked: "Đã chặn",
  },
  directions: {
    incoming: "Đã nhận",
    outgoing: "Đã gửi",
  },
  actions: {
    add: "Kết bạn",
    cancel: "Hủy lời mời",
    accept: "Chấp nhận",
    decline: "Từ chối",
    friends: "Bạn bè",
    unfriend: "Hủy kết bạn",
    block: "Chặn",
    unblock: "Bỏ chặn",
    editProfile: "Chỉnh sửa hồ sơ",
    friendsPage: "Bạn bè",
    moreFor: "Thêm tùy chọn cho {name}",
    friendMenuFor: "Bạn bè với {name}",
  },
  success: {
    send: "Đã gửi lời mời kết bạn.",
    accept: "Hai bạn đã trở thành bạn bè.",
    decline: "Đã từ chối lời mời.",
    cancel: "Đã hủy lời mời.",
    unfriend: "Đã hủy kết bạn.",
    block: "Đã chặn người này.",
    unblock: "Đã bỏ chặn.",
    nowFriends: "Hai bạn đã trở thành bạn bè.",
  },
  actionErrorTitle: "Không thực hiện được",
  confirm: {
    unfriend: {
      title: "Hủy kết bạn với {name}?",
      body: "Hai bạn sẽ không còn là bạn bè. Bạn có thể gửi lại lời mời bất cứ lúc nào.",
      confirmLabel: "Hủy kết bạn",
      cancelLabel: "Giữ lại",
    },
    block: {
      title: "Chặn {name}?",
      body: "Hai bạn sẽ không thấy trang cá nhân của nhau và không gửi được lời mời cho nhau. Nếu đang là bạn bè hoặc có lời mời chờ, chúng sẽ bị xóa. Bạn có thể bỏ chặn bất cứ lúc nào.",
      confirmLabel: "Chặn",
      cancelLabel: "Không chặn",
    },
  },
  backendErrors: {
    FRIEND_REQUEST_NOT_ALLOWED: "Không thể gửi lời mời cho người này.",
    ALREADY_FRIENDS: "Hai bạn đã là bạn bè.",
    SEARCH_TERM_TOO_SHORT: "Nhập ít nhất {min} ký tự.",
    FRIENDSHIP_LEARNERS_ONLY: "Tính năng bạn bè dành cho học viên.",
    FRIENDSHIP_NOT_FOUND: "Hai bạn không còn là bạn bè.",
    FRIENDSHIP_NOT_ACCEPTED: "Hai bạn chưa là bạn bè.",
    FRIEND_REQUEST_NOT_FOUND: "Lời mời này không còn nữa.",
    FRIEND_REQUEST_NOT_PENDING: "Lời mời này đã được trả lời.",
    FRIEND_REQUEST_NOT_ADDRESSEE:
      "Chỉ người được mời mới chấp nhận được lời mời.",
    FRIENDSHIP_SELF: "Bạn không thể kết bạn với chính mình.",
    BLOCK_SELF: "Bạn không thể tự chặn mình.",
    LEARNER_NOT_FOUND: "Không tìm thấy học viên này.",
  },
  genericError: "Có lỗi xảy ra. Vui lòng thử lại.",
  list: {
    loadErrorTitle: "Không tải được danh sách",
    loadErrorDescription: "Máy chủ chưa phản hồi. Thử lại sau ít phút.",
    retry: "Thử lại",
    friendsEmptyTitle: "Bạn chưa có bạn bè nào",
    friendsEmptyDescription: "Thử tìm bạn theo tên để gửi lời mời.",
    friendsEmptyAction: "Tìm bạn",
    incomingEmptyTitle: "Không có lời mời nào",
    incomingEmptyDescription: "Lời mời kết bạn bạn nhận được sẽ hiện ở đây.",
    outgoingEmptyTitle: "Bạn chưa gửi lời mời nào",
    outgoingEmptyDescription:
      "Lời mời bạn đã gửi và đang chờ trả lời sẽ hiện ở đây.",
    blockedEmptyTitle: "Bạn chưa chặn ai",
    blockedEmptyDescription:
      "Người bạn chặn sẽ hiện ở đây để bạn có thể bỏ chặn.",
    friendsSince: "Bạn bè từ",
    requestReceived: "Gửi lời mời ngày",
    requestSent: "Bạn đã gửi ngày",
    blockedSince: "Chặn từ",
  },
  search: {
    label: "Tìm học viên theo tên",
    placeholder: "Nhập tên hiển thị",
    idleTitle: "Tìm bạn theo tên",
    idleDescription: "Nhập tên hiển thị của học viên để gửi lời mời kết bạn.",
    tooShort: "Nhập ít nhất {min} ký tự.",
    emptyTitle: "Không tìm thấy học viên nào",
    emptyDescription: "Thử một tên khác.",
    loadErrorTitle: "Không tìm kiếm được",
  },
  learnersOnly: {
    title: "Tính năng bạn bè dành cho học viên",
    description:
      "Tài khoản quản trị không gửi hay nhận lời mời kết bạn. Trang cá nhân của bạn vẫn hiển thị với mọi người.",
    action: "Về trang quản trị",
  },
  wall: {
    backLabel: "Về trang chủ",
    fallbackName: "người này",
    thing: "người dùng",
    notFoundDescription:
      "Người dùng này không tồn tại, hoặc đường dẫn bị sai. Thử tìm bạn theo tên.",
    unavailableTitle: "Trang này không khả dụng",
    unavailableDescription: "Hiện bạn không thể xem trang này.",
    staffBadge: "Nhân viên",
    joined: "Tham gia",
    friendCountOne: "{count} bạn bè",
    friendCountOther: "{count} bạn bè",
    profileErrorTitle: "Không tải được hồ sơ",
    profileErrorDescription: "Máy chủ chưa phản hồi. Thử lại sau ít phút.",
    retry: "Thử lại",
  },
  requestBadge: {
    labelOne: "{count} lời mời kết bạn đang chờ",
    labelOther: "{count} lời mời kết bạn đang chờ",
  },
};

export const friendsEn: FriendsTranslations = {
  pageTitle: "Friends",
  tabs: {
    friends: "Friends",
    requests: "Requests",
    // Not "Find friends": the four tabs, with "99+" on "Requests", need about
    // 311 px on a phone and a 320 px one has 288 for them. Measured in both
    // languages from 320 to 390 px; "Find" is what the tab does.
    search: "Find",
    blocked: "Blocked",
  },
  directions: {
    incoming: "Received",
    outgoing: "Sent",
  },
  actions: {
    add: "Add friend",
    cancel: "Cancel request",
    accept: "Accept",
    decline: "Decline",
    friends: "Friends",
    unfriend: "Unfriend",
    block: "Block",
    unblock: "Unblock",
    editProfile: "Edit profile",
    friendsPage: "Friends",
    moreFor: "More options for {name}",
    friendMenuFor: "Friends with {name}",
  },
  success: {
    send: "Friend request sent.",
    accept: "You are now friends.",
    decline: "Request declined.",
    cancel: "Request cancelled.",
    unfriend: "Friend removed.",
    block: "Blocked.",
    unblock: "Unblocked.",
    nowFriends: "You are now friends.",
  },
  actionErrorTitle: "That did not work",
  confirm: {
    unfriend: {
      title: "Unfriend {name}?",
      body: "You will no longer be friends. You can send a new request at any time.",
      confirmLabel: "Unfriend",
      cancelLabel: "Keep friend",
    },
    block: {
      title: "Block {name}?",
      body: "Neither of you will see the other's profile or be able to send the other a request. If you are friends, or a request is waiting, it is removed. You can unblock at any time.",
      confirmLabel: "Block",
      cancelLabel: "Do not block",
    },
  },
  backendErrors: {
    FRIEND_REQUEST_NOT_ALLOWED: "A request cannot be sent to this person.",
    ALREADY_FRIENDS: "You are already friends.",
    SEARCH_TERM_TOO_SHORT: "Type at least {min} characters.",
    FRIENDSHIP_LEARNERS_ONLY: "Friends are for learners.",
    FRIENDSHIP_NOT_FOUND: "You are no longer friends.",
    FRIENDSHIP_NOT_ACCEPTED: "You are not friends yet.",
    FRIEND_REQUEST_NOT_FOUND: "This request no longer exists.",
    FRIEND_REQUEST_NOT_PENDING: "This request has already been answered.",
    FRIEND_REQUEST_NOT_ADDRESSEE:
      "Only the person who was asked can accept a request.",
    FRIENDSHIP_SELF: "You cannot befriend yourself.",
    BLOCK_SELF: "You cannot block yourself.",
    LEARNER_NOT_FOUND: "This learner could not be found.",
  },
  genericError: "Something went wrong. Please try again.",
  list: {
    loadErrorTitle: "Could not load the list",
    loadErrorDescription:
      "The server did not answer. Try again in a few minutes.",
    retry: "Try again",
    friendsEmptyTitle: "You have no friends yet",
    friendsEmptyDescription: "Search for someone by name to send a request.",
    friendsEmptyAction: "Find friends",
    incomingEmptyTitle: "No requests",
    incomingEmptyDescription: "Friend requests you receive will show up here.",
    outgoingEmptyTitle: "You have not sent any requests",
    outgoingEmptyDescription:
      "Requests you have sent and that are waiting for an answer will show up here.",
    blockedEmptyTitle: "You have not blocked anyone",
    blockedEmptyDescription:
      "People you block show up here so you can unblock them.",
    friendsSince: "Friends since",
    requestReceived: "Request received on",
    requestSent: "You sent it on",
    blockedSince: "Blocked since",
  },
  search: {
    label: "Search learners by name",
    placeholder: "Type a display name",
    idleTitle: "Find friends by name",
    idleDescription: "Type a learner's display name to send a friend request.",
    tooShort: "Type at least {min} characters.",
    emptyTitle: "No learners found",
    emptyDescription: "Try a different name.",
    loadErrorTitle: "Could not search",
  },
  learnersOnly: {
    title: "Friends are for learners",
    description:
      "Administration accounts do not send or receive friend requests. Your profile page is still visible to everyone.",
    action: "Back to administration",
  },
  wall: {
    backLabel: "Back to home",
    fallbackName: "this person",
    thing: "user",
    notFoundDescription:
      "This user does not exist, or the link is wrong. Try finding them by name.",
    unavailableTitle: "This page is not available",
    unavailableDescription: "You cannot view this page right now.",
    staffBadge: "Staff",
    joined: "Joined",
    friendCountOne: "{count} friend",
    friendCountOther: "{count} friends",
    profileErrorTitle: "Could not load the profile",
    profileErrorDescription:
      "The server did not answer. Try again in a few minutes.",
    retry: "Try again",
  },
  requestBadge: {
    labelOne: "{count} friend request waiting",
    labelOther: "{count} friend requests waiting",
  },
};
