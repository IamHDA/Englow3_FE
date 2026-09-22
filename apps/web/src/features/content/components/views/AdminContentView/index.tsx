"use client";

import {
  Alert,
  Card,
  Container,
  Group,
  Pagination,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Search, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { ContentKind, ContentStatus, Role } from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useAdminContentQuery,
  useApproveContentMutation,
  useArchiveContentMutation,
  useCurrentUserQuery,
  usePublishContentMutation,
  useRejectContentMutation,
  useSubmitContentForReviewMutation,
} from "@/lib/graphql/generated/hooks";

import {
  ADMIN_CONTENT_PAGE_SIZE,
  CONTENT_ERROR_MESSAGES,
  CONTENT_GENERIC_ERROR,
  CONTENT_KIND_LABELS,
  CONTENT_STATUS_LABELS,
} from "../../../constants/adminContent";
import type { ContentReviewItem } from "../../../types";
import { ContentReviewTable } from "../../blocks/ContentReviewTable";
import { FlashcardImportPanel } from "../../blocks/FlashcardImportPanel";
import { ContentReviewTableSkeleton } from "../../blocks/ContentReviewTable/ContentReviewTableSkeleton";
import { RejectContentModal } from "../../blocks/RejectContentModal";

/** BFF trả mã này khi backend đáp 403. */
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

const KIND_TABS = [
  ContentKind.FLASHCARD_SET,
  ContentKind.QUIZ,
  ContentKind.DICTATION_LESSON,
  ContentKind.SPEAKING_PROMPT,
];

const STATUS_OPTIONS = [
  { value: "", label: "Mọi trạng thái" },
  ...Object.values(ContentStatus).map((status) => ({
    value: status,
    label: CONTENT_STATUS_LABELS[status],
  })),
];

/**
 * Một màn cho cả bốn loại nội dung. Bốn loại dùng chung một quy trình duyệt,
 * nên bốn màn gần-giống-nhau sẽ là bốn chỗ phải sửa mỗi lần quy trình đổi.
 * `kind` chỉ đi vào query và vào nhãn.
 */
export function AdminContentView() {
  const [kind, setKind] = useState<ContentKind>(ContentKind.FLASHCARD_SET);
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<ContentReviewItem | null>(null);
  const [importingInto, setImportingInto] = useState<string | null>(null);

  const { data, loading, error, refetch } = useAdminContentQuery({
    variables: {
      kind,
      status,
      title: title === "" ? null : title,
      page,
      size: ADMIN_CONTENT_PAGE_SIZE,
    },
    fetchPolicy: "cache-and-network",
  });

  // Vai trò chỉ để vẽ giao diện. Backend vẫn tự kiểm tra từ token.
  const { data: meData } = useCurrentUserQuery();
  const canReview = meData?.me.role === Role.ADMIN;

  const [submitForReview] = useSubmitContentForReviewMutation();
  const [approveContent] = useApproveContentMutation();
  const [rejectContent] = useRejectContentMutation();
  const [publishContent] = usePublishContentMutation();
  const [archiveContent] = useArchiveContentMutation();

  async function runAction(
    id: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setBusyId(id);
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
          (code && CONTENT_ERROR_MESSAGES[code]) ?? CONTENT_GENERIC_ERROR,
      });
    } finally {
      setBusyId(null);
    }
  }

  const items = data?.adminContent.items ?? [];
  const draftSets = items.filter((item) => item.status === ContentStatus.DRAFT);
  const totalPages = data?.adminContent.totalPages ?? 0;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={1} size="h2" c="navy.9">
            Quản lý nội dung học
          </Title>
          <Text size="sm" c="ink.6">
            {canReview
              ? "Bộ thẻ từ, bài trắc nghiệm, bài nghe chép và câu luyện nói ở mọi trạng thái, kèm việc duyệt."
              : "Bạn soạn và gửi duyệt; quản trị viên là người duyệt hoặc trả lại."}
          </Text>
        </Stack>

        <Group justify="center">
          <SegmentedControl
            size="md"
            value={kind}
            onChange={(next) => {
              setKind(next as ContentKind);
              // Đổi loại thì về trang đầu - giữ trang 3 của loại cũ sẽ ra rỗng.
              setPage(0);
            }}
            data={KIND_TABS.map((value) => ({
              value,
              label: CONTENT_KIND_LABELS[value],
            }))}
          />
        </Group>

        <Card radius="lg" withBorder p="md">
          <Group gap="md" align="flex-end">
            <TextInput
              label="Tìm theo tên"
              placeholder="Nhập tên nội dung"
              leftSection={<Search size={16} />}
              value={title}
              onChange={(event) => {
                setTitle(event.currentTarget.value);
                setPage(0);
              }}
              radius="md"
              style={{ flex: 1, minWidth: 220 }}
            />
            <Select
              label="Trạng thái"
              data={STATUS_OPTIONS}
              value={status ?? ""}
              onChange={(next) => {
                setStatus(
                  next === "" || next === null ? null : (next as ContentStatus),
                );
                setPage(0);
              }}
              radius="md"
              w={200}
              allowDeselect={false}
            />
          </Group>
        </Card>

        {/* Chỉ với bộ thẻ, và chỉ bộ còn nháp: import từ chối mọi thứ đã xuất
            bản, nên đưa một bộ đã publish vào đây chỉ để nhận lỗi. */}
        {kind === ContentKind.FLASHCARD_SET && draftSets.length > 0 && (
          <Stack gap="sm">
            <Select
              label="Nhập thẻ vào bộ nháp"
              placeholder="Chọn một bộ còn nháp"
              data={draftSets.map((set) => ({ value: set.id, label: set.title }))}
              value={importingInto}
              onChange={setImportingInto}
              radius="md"
              maw={420}
              clearable
            />
            {importingInto && <FlashcardImportPanel setId={importingInto} />}
          </Stack>
        )}

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
          ) : error && items.length === 0 ? (
            <Alert color="warn" title="Không tải được danh sách" m="md">
              <Text size="sm">
                Kiểm tra kết nối tới backend rồi tải lại trang.
              </Text>
            </Alert>
          ) : loading && items.length === 0 ? (
            <Stack p="md">
              <ContentReviewTableSkeleton />
            </Stack>
          ) : items.length === 0 ? (
            <Stack p="xl" align="center" gap={6}>
              <Text fw={600} c="navy.9">
                Không có mục nào khớp bộ lọc
              </Text>
              <Text size="sm" c="ink.5">
                Thử bỏ bớt điều kiện lọc hoặc xoá từ khoá tìm kiếm.
              </Text>
            </Stack>
          ) : (
            <ContentReviewTable
              kind={kind}
              items={items}
              busyId={busyId}
              canReview={canReview}
              onSubmitForReview={(id) =>
                runAction(
                  id,
                  () => submitForReview({ variables: { kind, id } }),
                  "Đã gửi đi duyệt.",
                )
              }
              onApprove={(id) =>
                runAction(
                  id,
                  () => approveContent({ variables: { kind, id } }),
                  "Đã duyệt và phát hành.",
                )
              }
              onReject={setRejecting}
              onPublish={(id) =>
                runAction(
                  id,
                  () => publishContent({ variables: { kind, id } }),
                  "Đã phát hành.",
                )
              }
              onArchive={(id) =>
                runAction(
                  id,
                  () => archiveContent({ variables: { kind, id } }),
                  "Đã lưu trữ.",
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

      <RejectContentModal
        itemTitle={rejecting?.title ?? null}
        submitting={rejecting !== null && busyId === rejecting.id}
        onCancel={() => setRejecting(null)}
        onConfirm={async (note) => {
          const target = rejecting;
          if (target === null) return;
          // Đóng hộp thoại trước khi gọi: giữ nó mở trong lúc chờ rồi đóng sau
          // sẽ nhấp nháy, còn kết quả đã có ở notification.
          setRejecting(null);
          await runAction(
            target.id,
            () => rejectContent({ variables: { kind, id: target.id, note } }),
            "Đã trả lại kèm lý do.",
          );
        }}
      />
    </Container>
  );
}
