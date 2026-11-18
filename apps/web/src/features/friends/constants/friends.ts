import type { ConfirmableActionKind, RelationshipActionKind } from "../types";

export type FriendsTab = "friends" | "requests" | "search" | "blocked";

export const DEFAULT_FRIENDS_TAB: FriendsTab = "friends";

export const FRIENDS_TABS: { value: FriendsTab; label: string }[] = [
  { value: "friends", label: "Bạn bè" },
  { value: "requests", label: "Lời mời" },
  { value: "search", label: "Tìm bạn" },
  { value: "blocked", label: "Đã chặn" },
];

export type RequestDirection = "incoming" | "outgoing";

export const REQUEST_DIRECTIONS: { value: RequestDirection; label: string }[] =
  [
    { value: "incoming", label: "Đã nhận" },
    { value: "outgoing", label: "Đã gửi" },
  ];

/** How many rows a list shows per page. The backend allows up to 50. */
export const FRIENDS_PAGE_SIZE = 20;

/** The backend's own cap on a page, used when scanning every page of the sent requests. */
export const FRIENDS_MAX_PAGE_SIZE = 50;

/** Shortest search the backend answers - it refuses anything shorter with SEARCH_TERM_TOO_SHORT. */
export const MIN_SEARCH_TERM_LENGTH = 2;

export const SEARCH_DEBOUNCE_MS = 300;

/** How often the header asks again how many requests are waiting. */
export const REQUEST_COUNT_POLL_MS = 60_000;

/** Beyond this the header badge says "99+". */
export const REQUEST_BADGE_MAX = 99;

export const DATE_LOCALE = "vi-VN";

/**
 * Names of the queries that show who stands where with whom: every one is
 * refreshed after a friendship change. They are the operation names in
 * graphql/*.graphql.
 */
export const AFFECTED_QUERY_NAMES: ReadonlySet<string> = new Set([
  "Relationship",
  "UserWall",
  "Friends",
  "IncomingFriendRequests",
  "OutgoingFriendRequests",
  "IncomingFriendRequestCount",
  "BlockedUsers",
  "SearchLearners",
]);

/** Backend codes the screens branch on. */
export const BACKEND_CODES = {
  userNotFound: "USER_NOT_FOUND",
  friendRequestNotFound: "FRIEND_REQUEST_NOT_FOUND",
} as const;

export const FRIENDS_ROUTES = {
  friends: "/friends",
  requests: "/friends?tab=requests",
  search: "/friends?tab=search",
  profile: "/profile",
  admin: "/admin",
  home: "/",
  wall: (userId: string) => `/people/${encodeURIComponent(userId)}`,
} as const;

export const ACTION_LABELS = {
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
  more: "Thêm tùy chọn",
} as const;

/** What the toast says once an action went through. */
export const ACTION_SUCCESS_MESSAGES: Record<RelationshipActionKind, string> = {
  send: "Đã gửi lời mời kết bạn.",
  accept: "Hai bạn đã trở thành bạn bè.",
  decline: "Đã từ chối lời mời.",
  cancel: "Đã hủy lời mời.",
  unfriend: "Đã hủy kết bạn.",
  block: "Đã chặn người này.",
  unblock: "Đã bỏ chặn.",
};

/** Sending a request to someone who had already asked answers theirs instead. */
export const NOW_FRIENDS_MESSAGE = "Hai bạn đã trở thành bạn bè.";

export const ACTION_ERROR_TITLE = "Không thực hiện được";

export const CONFIRM_COPY: Record<
  ConfirmableActionKind,
  { title: string; body: string; confirmLabel: string; cancelLabel: string }
> = {
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
};

/** Sentence for a backend refusal, by the backend's own code. */
export const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  FRIEND_REQUEST_NOT_ALLOWED: "Không thể gửi lời mời cho người này.",
  ALREADY_FRIENDS: "Hai bạn đã là bạn bè.",
  SEARCH_TERM_TOO_SHORT: "Nhập ít nhất 2 ký tự.",
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
};

/** For a code nobody wrote a sentence for, and for a failure with no code at all. */
export const GENERIC_ERROR_MESSAGE = "Có lỗi xảy ra. Vui lòng thử lại.";

export const LIST_COPY = {
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
  pageLabel: "Phân trang",
} as const;

export const SEARCH_COPY = {
  label: "Tìm học viên theo tên",
  placeholder: "Nhập tên hiển thị",
  idleTitle: "Tìm bạn theo tên",
  idleDescription: "Nhập tên hiển thị của học viên để gửi lời mời kết bạn.",
  tooShort: `Nhập ít nhất ${MIN_SEARCH_TERM_LENGTH} ký tự.`,
  emptyTitle: "Không tìm thấy học viên nào",
  emptyDescription: "Thử một tên khác.",
  loadErrorTitle: "Không tìm kiếm được",
} as const;

export const LEARNERS_ONLY_COPY = {
  title: "Tính năng bạn bè dành cho học viên",
  description:
    "Tài khoản quản trị không gửi hay nhận lời mời kết bạn. Trang cá nhân của bạn vẫn hiển thị với mọi người.",
  action: "Về trang quản trị",
} as const;

export const WALL_COPY = {
  thing: { vi: "người dùng", en: "user" },
  backLabel: "Về trang chủ",
  /** Stands in for the name in the confirmation when the profile did not load. */
  fallbackName: "người này",
  unavailableTitle: "Trang này không khả dụng",
  unavailableDescription: "Hiện bạn không thể xem trang này.",
  staffBadge: "Nhân viên",
  joined: "Tham gia",
  friendCountSuffix: "bạn bè",
  profileErrorTitle: "Không tải được hồ sơ",
  profileErrorDescription: "Máy chủ chưa phản hồi. Thử lại sau ít phút.",
  retry: "Thử lại",
} as const;

export const REQUEST_BADGE_COPY = {
  hiddenLabel: "lời mời kết bạn đang chờ",
} as const;
