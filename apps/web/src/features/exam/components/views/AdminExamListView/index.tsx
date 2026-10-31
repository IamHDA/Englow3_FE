"use client";

import { paginationControlProps } from "@/shared/a11y/paginationControls";

import { useLanguage } from "@/shared/hooks/useLanguage";
import Link from "next/link";
import { Button } from "@mantine/core";

import { Alert, Card, Group, Pagination, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ShieldAlert } from "lucide-react";
import { useRef, useState } from "react";

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
  useRestoreExamMutation,
  useCurrentUserQuery,
  usePublishExamMutation,
  useRejectExamMutation,
  useSubmitExamForReviewMutation,
} from "@/lib/graphql/generated/hooks";
import { backendCodeOf, errorCodeOf } from "@/shared/network/loadError";
import { Page, PageHeader } from "@/shared/components/Page";

const INITIAL_FILTERS: AdminExamFiltersState = {
  status: null,
  examType: null,
  title: "",
};

/** BFF trả mã này khi backend đáp 403 - tài khoản không có vai trò cần thiết. */
const FORBIDDEN_CODE = "FORBIDDEN";

function isForbidden(error: unknown): boolean {
  return errorCodeOf(error) === FORBIDDEN_CODE;
}

export function AdminExamListView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
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
  const [restoreExam] = useRestoreExamMutation();
  const [submitExamForReview] = useSubmitExamForReviewMutation();
  const [approveExam] = useApproveExamMutation();
  const [rejectExam] = useRejectExamMutation();

  function handleFiltersChange(next: AdminExamFiltersState) {
    setFilters(next);
    // Lọc lại thì về trang đầu - giữ nguyên trang 3 của bộ lọc cũ sẽ ra rỗng.
    setPage(0);
  }

  const actionPending = useRef(false);

  async function runAction(
    id: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> {
    if (actionPending.current) return false;
    actionPending.current = true;
    setBusyExamId(id);
    try {
      await action();
      notifications.show({ color: "green", message: successMessage });
      await refetch().catch(() =>
        notifications.show({
          color: "orange",
          message: tr(
            "Thao tác đã lưu; danh sách chưa cập nhật. Hãy tải lại.",
            "Saved, but the list did not refresh. Reload the page.",
          ),
        }),
      );
      return true;
    } catch (actionError) {
      const code = backendCodeOf(actionError);
      const words =
        (code ? ADMIN_EXAM_ERROR_MESSAGES[code] : undefined) ??
        ADMIN_EXAM_GENERIC_ERROR;
      notifications.show({
        color: "warn",
        title: tr("Không thực hiện được", "That did not work"),
        message: isVi ? words.vi : words.en,
      });
      return false;
    } finally {
      actionPending.current = false;
      setBusyExamId(null);
    }
  }

  const exams = data?.adminExams.items ?? [];
  const totalPages = data?.adminExams.totalPages ?? 0;

  return (
    <Page>
      <Stack gap="lg">
        <Stack gap={4}>
          <Group justify="space-between">
            <PageHeader title={tr("Quản lý đề thi", "Exams")} />
            <Button component={Link} href={`/admin/content/editor/EXAM/new`}>
              {tr("Tạo mới", "Create")}
            </Button>
          </Group>
          {!canReview && (
            <Text size="sm" c="ink.6">
              {tr(
                "Bạn soạn và gửi duyệt; quản trị viên là người duyệt hoặc trả lại.",
                "You write and submit; an administrator approves or returns it.",
              )}
            </Text>
          )}
        </Stack>

        <AdminExamFilters value={filters} onChange={handleFiltersChange} />

        <Card radius="lg" withBorder p={0}>
          {isForbidden(error) ? (
            <Alert
              color="warn"
              icon={<ShieldAlert size={18} />}
              title={tr("Không có quyền truy cập", "No access")}
              m="md"
            >
              <Text size="sm">
                {tr(
                  "Tài khoản này không có vai trò quản trị hoặc nhân viên nội dung. Đăng nhập bằng tài khoản phù hợp rồi thử lại.",
                  "This account is not an administrator or content staff. Sign in with the right account and try again.",
                )}
              </Text>
            </Alert>
          ) : error && exams.length === 0 ? (
            <Alert
              color="warn"
              title={tr(
                "Không tải được danh sách đề",
                "Could not load the exams",
              )}
              m="md"
            >
              <Text size="sm">
                {tr(
                  "Kiểm tra kết nối rồi thử lại.",
                  "Check the connection and try again.",
                )}{" "}
                <Button
                  variant="light"
                  onClick={() => void refetch().catch(() => undefined)}
                >
                  {tr("Thử lại", "Try again")}
                </Button>
              </Text>
            </Alert>
          ) : loading && exams.length === 0 ? (
            <Stack p="md">
              <AdminExamTableSkeleton />
            </Stack>
          ) : exams.length === 0 ? (
            <Stack p="xl" align="center" gap={6}>
              <Text fw={600} c="navy.9">
                {tr(
                  "Không có đề nào khớp bộ lọc",
                  "No exam matches the filters",
                )}
              </Text>
              <Text size="sm" c="ink.5">
                {tr(
                  "Thử bỏ bớt điều kiện lọc hoặc xoá từ khoá tìm kiếm.",
                  "Try removing a filter or clearing the search.",
                )}
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
                  tr("Đã gửi đề đi duyệt.", "Submitted for review."),
                )
              }
              onApprove={(id) =>
                runAction(
                  id,
                  () => approveExam({ variables: { id } }),
                  tr(
                    "Đã duyệt và phát hành đề thi.",
                    "Approved and published.",
                  ),
                )
              }
              onReject={setRejecting}
              onPublish={(id) =>
                runAction(
                  id,
                  () => publishExam({ variables: { id } }),
                  tr("Đã phát hành đề thi.", "Published."),
                )
              }
              onArchive={(id) =>
                runAction(
                  id,
                  () => archiveExam({ variables: { id } }),
                  tr("Đã lưu trữ đề thi.", "Archived."),
                )
              }
              onRestore={(id) =>
                runAction(
                  id,
                  () => restoreExam({ variables: { id } }),
                  tr("Đã khôi phục đề thi.", "Restored."),
                )
              }
            />
          )}
        </Card>

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              getControlProps={paginationControlProps(isVi)}
              total={totalPages}
              value={page + 1}
              onChange={(next) => setPage(next - 1)}
              radius="md"
            />
          </Group>
        )}
      </Stack>

      <RejectExamModal
        key={rejecting?.id ?? "closed"}
        examTitle={rejecting?.title ?? null}
        submitting={rejecting !== null && busyExamId === rejecting.id}
        onCancel={() => {
          if (!busyExamId) setRejecting(null);
        }}
        onConfirm={async (note) => {
          const target = rejecting;
          if (target === null) return false;
          const succeeded = await runAction(
            target.id,
            () => rejectExam({ variables: { id: target.id, note } }),
            tr("Đã trả lại đề kèm lý do.", "Returned with a reason."),
          );
          if (succeeded) setRejecting(null);
          return succeeded;
        }}
      />
    </Page>
  );
}
