"use client";

import {
  Alert,
  Card,
  Container,
  Group,
  Pagination,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";

import {
  ADMIN_EXAMS_PAGE_SIZE,
  ADMIN_EXAM_ERROR_MESSAGES,
  ADMIN_EXAM_GENERIC_ERROR,
} from "../../../constants/adminExams";
import {
  AdminExamFilters,
  type AdminExamFiltersState,
} from "../../blocks/AdminExamFilters";
import { AdminExamTable } from "../../blocks/AdminExamTable";
import { AdminExamTableSkeleton } from "../../blocks/AdminExamTable/AdminExamTableSkeleton";
import { RejectExamModal } from "../../blocks/RejectExamModal";

import { Role } from "@/lib/graphql/generated";
import type { AdminExamFieldsFragment } from "@/lib/graphql/generated/documents";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useAdminExamsQuery,
  useApproveExamMutation,
  useArchiveExamMutation,
  useCurrentUserQuery,
  usePublishExamMutation,
  useRejectExamMutation,
  useSubmitExamForReviewMutation,
} from "@/lib/graphql/generated/hooks";

const INITIAL_FILTERS: AdminExamFiltersState = {
  status: null,
  examType: null,
  title: "",
};

/** BFF trả mã này khi backend đáp 403 - tài khoản không có vai trò cần thiết. */
const FORBIDDEN_CODE = "FORBIDDEN";

function backendCodeOf(error: unknown): string | null {
  if (
    error != null &&
    typeof error === "object" &&
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors)
  ) {
    const code = error.graphQLErrors[0]?.extensions?.backendCode;
    return typeof code === "string" ? code : null;
  }
  return null;
}

function isForbidden(error: unknown): boolean {
  if (
    error != null &&
    typeof error === "object" &&
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors)
  ) {
    return error.graphQLErrors[0]?.extensions?.code === FORBIDDEN_CODE;
  }
  return false;
}

export function AdminExamListView() {
  const [filters, setFilters] =
    useState<AdminExamFiltersState>(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [busyExamId, setBusyExamId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminExamFieldsFragment | null>(
    null,
  );

  const { data, loading, error, refetch } = useAdminExamsQuery({
    variables: {
      status: filters.status,
      examType: filters.examType,
      title: filters.title === "" ? null : filters.title,
      page,
      size: ADMIN_EXAMS_PAGE_SIZE,
    },
    fetchPolicy: "cache-and-network",
  });

  // Vai trò chỉ để vẽ giao diện. Backend vẫn tự kiểm tra từ token, nên ẩn nút ở
  // đây không phải là lớp bảo vệ - nó chỉ đỡ cho nhân viên nội dung một cú bấm
  // chắc chắn bị 403.
  const { data: meData } = useCurrentUserQuery();
  const canReview = meData?.me.role === Role.ADMIN;

  const [publishExam] = usePublishExamMutation();
  const [archiveExam] = useArchiveExamMutation();
  const [submitExamForReview] = useSubmitExamForReviewMutation();
  const [approveExam] = useApproveExamMutation();
  const [rejectExam] = useRejectExamMutation();

  function handleFiltersChange(next: AdminExamFiltersState) {
    setFilters(next);
    // Lọc lại thì về trang đầu - giữ nguyên trang 3 của bộ lọc cũ sẽ ra rỗng.
    setPage(0);
  }

  async function runAction(
    id: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setBusyExamId(id);
    try {
      await action();
      await refetch();
      notifications.show({ color: "green", message: successMessage });
    } catch (actionError) {
      const code = backendCodeOf(actionError);
      notifications.show({
        color: "warn",
        title: "Không thực hiện được",
        message:
          (code && ADMIN_EXAM_ERROR_MESSAGES[code]) ?? ADMIN_EXAM_GENERIC_ERROR,
      });
    } finally {
      setBusyExamId(null);
    }
  }

  const exams = data?.adminExams.items ?? [];
  const totalPages = data?.adminExams.totalPages ?? 0;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={1} size="h2" c="navy.9">
            Quản lý đề thi
          </Title>
          {!canReview && (
            <Text size="sm" c="ink.6">
              Bạn soạn và gửi duyệt; quản trị viên là người duyệt hoặc trả lại.
            </Text>
          )}
        </Stack>

        <AdminExamFilters value={filters} onChange={handleFiltersChange} />

        <Card radius="lg" withBorder p={0}>
          {isForbidden(error) ? (
            <Alert
              color="warn"
              icon={<ShieldAlert size={18} />}
              title="Không có quyền truy cập"
              m="md"
            >
              <Text size="sm">
                Tài khoản này không có vai trò quản trị hoặc nhân viên nội dung.
                Đăng nhập bằng tài khoản phù hợp rồi thử lại.
              </Text>
            </Alert>
          ) : error && exams.length === 0 ? (
            <Alert color="warn" title="Không tải được danh sách đề" m="md">
              <Text size="sm">
                Kiểm tra kết nối tới backend rồi tải lại trang.
              </Text>
            </Alert>
          ) : loading && exams.length === 0 ? (
            <Stack p="md">
              <AdminExamTableSkeleton />
            </Stack>
          ) : exams.length === 0 ? (
            <Stack p="xl" align="center" gap={6}>
              <Text fw={600} c="navy.9">
                Không có đề nào khớp bộ lọc
              </Text>
              <Text size="sm" c="ink.5">
                Thử bỏ bớt điều kiện lọc hoặc xoá từ khoá tìm kiếm.
              </Text>
            </Stack>
          ) : (
            <AdminExamTable
              exams={exams}
              busyExamId={busyExamId}
              canReview={canReview}
              onSubmitForReview={(id) =>
                runAction(
                  id,
                  () => submitExamForReview({ variables: { id } }),
                  "Đã gửi đề đi duyệt.",
                )
              }
              onApprove={(id) =>
                runAction(
                  id,
                  () => approveExam({ variables: { id } }),
                  "Đã duyệt và phát hành đề thi.",
                )
              }
              onReject={setRejecting}
              onPublish={(id) =>
                runAction(
                  id,
                  () => publishExam({ variables: { id } }),
                  "Đã phát hành đề thi.",
                )
              }
              onArchive={(id) =>
                runAction(
                  id,
                  () => archiveExam({ variables: { id } }),
                  "Đã lưu trữ đề thi.",
                )
              }
            />
          )}
        </Card>

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              total={totalPages}
              value={page + 1}
              onChange={(next) => setPage(next - 1)}
              radius="md"
            />
          </Group>
        )}
      </Stack>

      <RejectExamModal
        examTitle={rejecting?.title ?? null}
        submitting={rejecting !== null && busyExamId === rejecting.id}
        onCancel={() => setRejecting(null)}
        onConfirm={async (note) => {
          const target = rejecting;
          if (target === null) return;
          // Đóng hộp thoại trước khi gọi: giữ nó mở trong lúc chờ rồi đóng sau
          // sẽ nhấp nháy, còn thông báo kết quả đã có ở notification.
          setRejecting(null);
          await runAction(
            target.id,
            () => rejectExam({ variables: { id: target.id, note } }),
            "Đã trả lại đề kèm lý do.",
          );
        }}
      />
    </Container>
  );
}
