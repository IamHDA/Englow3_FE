"use client";

import { paginationControlProps } from "@/shared/a11y/paginationControls";

import { useLanguage } from "@/shared/hooks/useLanguage";
import Link from "next/link";
import { Button } from "@mantine/core";

import {
  Alert,
  Card,
  Group,
  Pagination,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Search, ShieldAlert } from "lucide-react";
import { useRef, useState } from "react";

import { ContentKind, ContentStatus, Role } from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useAdminContentQuery,
  useApproveContentMutation,
  useArchiveContentMutation,
  useRestoreContentMutation,
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
import { backendCodeOf, errorCodeOf } from "@/shared/network/loadError";
import { Page, PageHeader } from "@/shared/components/Page";

/** BFF trả mã này khi backend đáp 403. */
const FORBIDDEN_CODE = "FORBIDDEN";

function isForbidden(error: unknown): boolean {
  return errorCodeOf(error) === FORBIDDEN_CODE;
}

const KIND_TABS = [
  ContentKind.FLASHCARD_SET,
  ContentKind.QUIZ,
  ContentKind.DICTATION_LESSON,
  ContentKind.SPEAKING_PROMPT,
];

function statusOptions(isVi: boolean) {
  return [
    { value: "", label: isVi ? "Mọi trạng thái" : "All statuses" },
    ...Object.values(ContentStatus).map((status) => ({
      value: status,
      label: isVi
        ? CONTENT_STATUS_LABELS[status].vi
        : CONTENT_STATUS_LABELS[status].en,
    })),
  ];
}

/**
 * Một màn cho cả bốn loại nội dung. Bốn loại dùng chung một quy trình duyệt,
 * nên bốn màn gần-giống-nhau sẽ là bốn chỗ phải sửa mỗi lần quy trình đổi.
 * `kind` chỉ đi vào query và vào nhãn.
 */
type AdminContentViewProps = {
  /** Mở thẳng một tab - ô "chờ duyệt" ở trang tổng quan dẫn tới đây. */
  initialKind?: ContentKind;
  initialStatus?: ContentStatus | null;
};

export function AdminContentView({
  initialKind = ContentKind.FLASHCARD_SET,
  initialStatus = null,
}: AdminContentViewProps = {}) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const [kind, setKind] = useState<ContentKind>(initialKind);
  const [status, setStatus] = useState<ContentStatus | null>(initialStatus);
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
  const [restoreContent] = useRestoreContentMutation();

  const actionPending = useRef(false);

  async function runAction(
    id: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> {
    if (actionPending.current) return false;
    actionPending.current = true;
    setBusyId(id);
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
        (code ? CONTENT_ERROR_MESSAGES[code] : undefined) ??
        CONTENT_GENERIC_ERROR;
      notifications.show({
        color: "warn",
        title: tr("Không thực hiện được", "That did not work"),
        message: isVi ? words.vi : words.en,
      });
      return false;
    } finally {
      actionPending.current = false;
      setBusyId(null);
    }
  }

  const items = data?.adminContent.items ?? [];
  const draftSets = items.filter((item) => item.status === ContentStatus.DRAFT);
  const totalPages = data?.adminContent.totalPages ?? 0;

  return (
    <Page>
      <Stack gap="lg">
        <Stack gap={4}>
          <Group justify="space-between">
            <PageHeader
              title={tr("Quản lý nội dung học", "Learning content")}
            />
            <Button component={Link} href={`/admin/content/editor/${kind}/new`}>
              {tr("Tạo mới", "Create")}
            </Button>
          </Group>
          {/* Staff need to know the approval is not theirs; an admin does not
              need the page described to them. */}
          {!canReview && (
            <Text size="sm" c="ink.6">
              {tr(
                "Bạn soạn và gửi duyệt; quản trị viên là người duyệt hoặc trả lại.",
                "You write and submit; an administrator approves or returns it.",
              )}
            </Text>
          )}
        </Stack>

        {/* Bốn tab dài hơn màn điện thoại: cho cuộn ngang thay vì tràn ra
            ngoài và che mất tab cuối. */}
        <ScrollArea type="auto" scrollbarSize={4} offsetScrollbars="x">
          <Group justify="center" wrap="nowrap" miw="max-content" mx="auto">
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
                label: isVi
                  ? CONTENT_KIND_LABELS[value].vi
                  : CONTENT_KIND_LABELS[value].en,
              }))}
            />
          </Group>
        </ScrollArea>

        <Card radius="lg" withBorder p="md">
          <Group gap="md" align="flex-end">
            <TextInput
              label={tr("Tìm theo tên", "Search by name")}
              placeholder={tr("Nhập tên nội dung", "Type a name")}
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
              label={tr("Trạng thái", "Status")}
              data={statusOptions(isVi)}
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

        {/* Bài nghe không cần chọn sẵn bài nào: một shadowing batch tự tạo ra
            bài của nó, mỗi clip một bài. */}
        {kind === ContentKind.DICTATION_LESSON && (
          <FlashcardImportPanel kind="dictation" />
        )}

        {/* Chỉ với bộ thẻ, và chỉ bộ còn nháp: import từ chối mọi thứ đã xuất
            bản, nên đưa một bộ đã publish vào đây chỉ để nhận lỗi. */}
        {kind === ContentKind.FLASHCARD_SET && draftSets.length > 0 && (
          <Stack gap="sm">
            <Select
              label={tr(
                "Nhập thẻ vào bộ nháp",
                "Import cards into a draft set",
              )}
              placeholder={tr("Chọn một bộ còn nháp", "Pick a draft set")}
              data={draftSets.map((set) => ({
                value: set.id,
                label: set.title,
              }))}
              value={importingInto}
              onChange={setImportingInto}
              radius="md"
              maw={420}
              clearable
            />
            {importingInto && (
              <FlashcardImportPanel key={importingInto} setId={importingInto} />
            )}
          </Stack>
        )}

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
          ) : error && items.length === 0 ? (
            <Alert
              color="warn"
              title={tr("Không tải được danh sách", "Could not load the list")}
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
                  Thử lại
                </Button>
              </Text>
            </Alert>
          ) : loading && items.length === 0 ? (
            <Stack p="md">
              <ContentReviewTableSkeleton />
            </Stack>
          ) : items.length === 0 ? (
            <Stack p="xl" align="center" gap={6}>
              <Text fw={600} c="navy.9">
                {tr(
                  "Không có mục nào khớp bộ lọc",
                  "Nothing matches the filters",
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
            <ContentReviewTable
              kind={kind}
              items={items}
              busyId={busyId}
              canReview={canReview}
              onSubmitForReview={(id) =>
                runAction(
                  id,
                  () => submitForReview({ variables: { kind, id } }),
                  tr("Đã gửi đi duyệt.", "Submitted for review."),
                )
              }
              onApprove={(id) =>
                runAction(
                  id,
                  () => approveContent({ variables: { kind, id } }),
                  tr("Đã duyệt và phát hành.", "Approved and published."),
                )
              }
              onReject={setRejecting}
              onPublish={(id) =>
                runAction(
                  id,
                  () => publishContent({ variables: { kind, id } }),
                  tr("Đã phát hành.", "Published."),
                )
              }
              onArchive={(id) =>
                runAction(
                  id,
                  () => archiveContent({ variables: { kind, id } }),
                  tr("Đã lưu trữ.", "Archived."),
                )
              }
              onRestore={(id) =>
                runAction(
                  id,
                  () => restoreContent({ variables: { kind, id } }),
                  tr("Đã khôi phục.", "Restored."),
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

      <RejectContentModal
        key={rejecting?.id ?? "closed"}
        itemTitle={rejecting?.title ?? null}
        submitting={rejecting !== null && busyId === rejecting.id}
        onCancel={() => {
          if (!busyId) setRejecting(null);
        }}
        onConfirm={async (note) => {
          const target = rejecting;
          if (target === null) return false;
          const succeeded = await runAction(
            target.id,
            () => rejectContent({ variables: { kind, id: target.id, note } }),
            tr("Đã trả lại kèm lý do.", "Returned with a reason."),
          );
          if (succeeded) setRejecting(null);
          return succeeded;
        }}
      />
    </Page>
  );
}
