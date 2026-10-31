import type {
  TutorConversationQuery,
  TutorConversationsQuery,
} from "@/lib/graphql/generated/documents";

/**
 * Lấy thẳng từ kiểu codegen sinh ra, không tự khai lại. Một type viết tay với
 * các field optional sẽ nuốt luôn field bị thiếu - nó thành `undefined` vĩnh
 * viễn thay vì thành lỗi biên dịch.
 */
export type TutorMessage =
  TutorConversationQuery["tutorConversation"]["messages"][number];

export type TutorConversationSummary =
  TutorConversationsQuery["tutorConversations"][number];
