/** Resource and report states, as the web's TutorManagementView names them. */
export const TUTOR_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Chờ duyệt",
  PUBLISHED: "Đã xuất bản",
  REJECTED: "Cần sửa",
  ARCHIVED: "Đã lưu trữ",
  OPEN: "Mới nhận",
  ASSIGNED: "Đã phân công",
  PROPOSED: "Chờ kết luận",
  RESOLVED: "Đã xử lý",
  DISMISSED: "Đã đóng",
};

export const REPORT_STATUSES = [
  "OPEN",
  "ASSIGNED",
  "PROPOSED",
  "RESOLVED",
  "DISMISSED",
] as const;

export const RESOURCE_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
] as const;

export const TUTOR_ADMIN_ERRORS: Record<string, string> = {
  TUTOR_RESOURCE_CONFLICT:
    "Học liệu vừa được người khác thay đổi. Tải lại rồi nhập lại thay đổi của bạn.",
  TUTOR_RESOURCE_STATE:
    "Học liệu đã đổi trạng thái. Tải lại để xem trạng thái hiện tại.",
  TUTOR_RESOURCE_ACTION: "Không thể thực hiện thao tác này với học liệu.",
  TUTOR_RESOURCE_NOT_FOUND: "Không còn học liệu này.",
  TUTOR_REPORT_STATE:
    "Báo cáo đã đổi trạng thái. Tải lại để xem trạng thái hiện tại.",
  TUTOR_REPORT_CLOSED: "Báo cáo đã được đóng.",
  TUTOR_REPORT_ACTION: "Không thể thực hiện thao tác này với báo cáo.",
  TUTOR_REPORT_NOT_FOUND:
    "Không còn báo cáo này hoặc nó đã được giao cho người khác.",
  TUTOR_ASSIGNEE_INVALID: "Người được chọn không thể nhận báo cáo này.",
  TUTOR_POLICY_STALE:
    "Admin khác vừa đổi cấu hình. Tải cấu hình hiện tại rồi nhập lại thay đổi.",
  TUTOR_POLICY_INVALID:
    "Cấu hình chưa hợp lệ: khi tiếp nhận, cần ít nhất một chế độ.",
  TUTOR_POLICY_CHANGE: "Ghi lý do thay đổi (ít nhất 5 ký tự).",
};

/** Who may still edit a resource: its author or an administrator, while it is a draft or sent back. */
export function canEditResource(
  resource: { status: string; authorId?: string | null },
  me: { id: string; role: string } | null | undefined,
) {
  return (
    ["DRAFT", "REJECTED"].includes(resource.status) &&
    (me?.role === "ADMIN" || me?.id === resource.authorId)
  );
}
