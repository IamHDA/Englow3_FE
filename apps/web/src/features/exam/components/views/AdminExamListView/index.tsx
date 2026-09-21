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

// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useAdminExamsQuery,
  useArchiveExamMutation,
  usePublishExamMutation,
} from "@/lib/graphql/generated/hooks";

const INITIAL_FILTERS: AdminExamFiltersState = {
  status: null,
  examType: null,
  title: "",
};

/** BFF trả mã này khi backend đáp 403 - tài khoản không có vai trò ADMIN. */
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

  const [publishExam] = usePublishExamMutation();
  const [archiveExam] = useArchiveExamMutation();

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
          <Text size="sm" c="ink.6">
            Danh sách đầy đủ gồm cả bản nháp và đề đã lưu trữ. Chỉ tài khoản
            quản trị mới xem được.
          </Text>
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
                Tài khoản này không có vai trò quản trị. Đăng nhập bằng tài
                khoản admin rồi thử lại.
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
    </Container>
  );
}
