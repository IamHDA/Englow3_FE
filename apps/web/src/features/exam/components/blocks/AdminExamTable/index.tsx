"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import {
  Archive,
  ArchiveRestore,
  Check,
  Ellipsis,
  Send,
  Undo2,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { useConfirm } from "@/shared/hooks/useConfirm";

import {
  EXAM_ACTIONS_BY_STATUS,
  EXAM_STATUS_COLORS,
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
} from "../../../constants/adminExams";

import { ExamStatus } from "@/lib/graphql/generated";
import type { AdminExamFieldsFragment } from "@/lib/graphql/generated/documents";

type AdminExamTableProps = {
  exams: AdminExamFieldsFragment[];
  /** Id của đề đang có thao tác chạy dở - chỉ khoá nút của đúng dòng đó. */
  busyExamId: string | null;
  /**
   * Tài khoản đang xem có quyền duyệt hay không. Nhân viên nội dung chỉ gửi
   * duyệt; phát hành, duyệt, trả lại và lưu trữ là của quản trị.
   */
  canReview: boolean;
  onSubmitForReview: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (exam: AdminExamFieldsFragment) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  /** Admin only; shown for archived rows. */
  onRestore?: (id: string) => void;
};

/**
 * The short columns (type, status, version, dates) keep to one line: the table
 * squeezed them while the title column took the room, so "Thi thử" broke in two
 * and the status badge was cut to "Bản …".
 */
const NO_WRAP = { whiteSpace: "nowrap" } as const;

function formatDate(value: string | null, isVi = true): string {
  if (value === null) return "—";
  return new Date(value).toLocaleDateString(isVi ? "vi-VN" : "en-GB");
}

export function AdminExamTable({
  exams,
  busyExamId,
  canReview,
  onSubmitForReview,
  onApprove,
  onReject,
  onPublish,
  onArchive,
  onRestore,
}: AdminExamTableProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const mobile = useMediaQuery("(max-width: 47.99em)");
  const { confirm, confirmModal } = useConfirm();

  const archive = async (exam: AdminExamFieldsFragment) => {
    const confirmed = await confirm({
      title: tr("Lưu trữ đề thi?", "Archive this exam?"),
      body: tr(
        `“${exam.title}” sẽ ẩn khỏi thư viện của học viên. Lịch sử và các bài đã nộp vẫn được giữ, và bạn có thể khôi phục lại sau.`,
        `“${exam.title}” leaves the learners' library. Its history and submissions are kept, and you can restore it later.`,
      ),
      confirmLabel: tr("Lưu trữ", "Archive"),
      danger: true,
    });
    if (confirmed) onArchive(exam.id);
  };

  /**
   * One row's actions: open it, the one step its state is waiting for as the
   * main button (publish a draft, approve what waits for review, resubmit what
   * came back, restore what is archived), and everything else under "⋯".
   * Four equal buttons a row made the next step hard to see.
   */
  const renderActions = (exam: AdminExamFieldsFragment) => {
    const busy = busyExamId === exam.id;
    const allowed = EXAM_ACTIONS_BY_STATUS[exam.status];
    const actions: Record<
      "submit" | "approve" | "reject" | "publish" | "restore" | "archive",
      { show: boolean; label: string; icon: LucideIcon; run: () => void }
    > = {
      submit: {
        show: allowed.submit,
        label: tr("Gửi duyệt", "Submit for review"),
        icon: Upload,
        run: () => onSubmitForReview(exam.id),
      },
      approve: {
        show: canReview && allowed.approve,
        label: tr("Duyệt", "Approve"),
        icon: Check,
        run: () => onApprove(exam.id),
      },
      reject: {
        show: canReview && allowed.reject,
        label: tr("Trả lại", "Return"),
        icon: Undo2,
        run: () => onReject(exam),
      },
      publish: {
        show: canReview && allowed.publish,
        label: tr("Phát hành", "Publish"),
        icon: Send,
        run: () => onPublish(exam.id),
      },
      restore: {
        show: canReview && Boolean(allowed.restore) && Boolean(onRestore),
        label: tr("Khôi phục", "Restore"),
        icon: ArchiveRestore,
        run: () => onRestore?.(exam.id),
      },
      archive: {
        show: canReview && allowed.archive,
        label: tr("Lưu trữ", "Archive"),
        icon: Archive,
        run: () => void archive(exam),
      },
    };
    const primary = (["publish", "approve", "submit", "restore"] as const).find(
      (key) => actions[key].show,
    );
    const more = (["submit", "reject", "archive"] as const).filter(
      (key) => actions[key].show && key !== primary,
    );
    const Main = primary ? actions[primary] : null;

    return (
      <Group gap="xs" justify="flex-end" wrap="nowrap">
        <Button
          component={Link}
          href={`/admin/content/editor/EXAM/${exam.id}`}
          variant="default"
          size="sm"
        >
          {exam.status === "DRAFT" || exam.status === "REJECTED"
            ? tr("Soạn / xem trước", "Edit / preview")
            : tr("Xem nội dung", "View")}
        </Button>
        {Main && (
          <Button
            size="sm"
            radius="md"
            color={primary === "approve" ? "teal" : undefined}
            loading={busy}
            leftSection={<Main.icon size={14} aria-hidden />}
            onClick={Main.run}
          >
            {Main.label}
          </Button>
        )}
        {more.length > 0 && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                disabled={busy}
                aria-label={tr(
                  `Thao tác khác cho “${exam.title}”`,
                  `More actions for “${exam.title}”`,
                )}
              >
                <Ellipsis size={18} aria-hidden />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {more.map((key) => {
                const { label, icon: Icon, run } = actions[key];
                return (
                  <Menu.Item
                    key={key}
                    color={key === "archive" ? "red" : undefined}
                    leftSection={<Icon size={14} aria-hidden />}
                    onClick={run}
                  >
                    {label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    );
  };
  if (mobile)
    return (
      <Stack p="md">
        {confirmModal}
        {exams.map((exam) => (
          <Card key={exam.id} withBorder>
            <Stack gap="sm">
              <Text fw={700} style={{ overflowWrap: "anywhere" }}>
                {exam.title}
              </Text>
              <Badge color={EXAM_STATUS_COLORS[exam.status]} w="fit-content">
                {isVi
                  ? EXAM_STATUS_LABELS[exam.status].vi
                  : EXAM_STATUS_LABELS[exam.status].en}
              </Badge>
              {exam.reviewNote && (
                <Text size="sm" c="orange">
                  {exam.reviewNote}
                </Text>
              )}
              <Text size="sm" c="dimmed">
                {formatDate(exam.createdAt, isVi)}
              </Text>
              {renderActions(exam)}
            </Stack>
          </Card>
        ))}
      </Stack>
    );

  return (
    <Table.ScrollContainer minWidth={980}>
      {confirmModal}
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{tr("Đề thi", "Exam")}</Table.Th>
            <Table.Th style={NO_WRAP}>{tr("Loại", "Type")}</Table.Th>
            <Table.Th style={NO_WRAP}>{tr("Trạng thái", "Status")}</Table.Th>
            <Table.Th style={NO_WRAP}>{tr("Phiên bản", "Version")}</Table.Th>
            <Table.Th style={NO_WRAP}>{tr("Tạo lúc", "Created")}</Table.Th>
            <Table.Th style={NO_WRAP}>{tr("Phát hành", "Published")}</Table.Th>
            <Table.Th ta="right">{tr("Thao tác", "Actions")}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {exams.map((exam) => {
            return (
              <Table.Tr key={exam.id}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm" fw={600} c="navy.9">
                      {exam.title}
                    </Text>
                    <Text size="sm" c="ink.5">
                      {exam.certificateType ??
                        tr("Không chứng chỉ", "No certificate")}
                      {exam.certificateVariant
                        ? ` · ${exam.certificateVariant}`
                        : ""}
                      {exam.targetLevel ? ` · ${exam.targetLevel}` : ""}
                    </Text>
                    {/*
                      Lý do trả lại hiện ngay ở dòng, không bắt mở trang chi
                      tiết: đây là nơi người viết đề biết bài của mình bị trả và
                      phải sửa gì.
                    */}
                    {exam.status === ExamStatus.REJECTED &&
                      exam.reviewNote !== null && (
                        <Text size="sm" c="yellow.8" fs="italic">
                          {tr("Lý do", "Reason")}: {exam.reviewNote}
                        </Text>
                      )}
                  </Stack>
                </Table.Td>
                <Table.Td style={NO_WRAP}>
                  <Text size="sm" c="ink.7">
                    {isVi
                      ? EXAM_TYPE_LABELS[exam.examType].vi
                      : EXAM_TYPE_LABELS[exam.examType].en}
                  </Text>
                </Table.Td>
                <Table.Td style={NO_WRAP}>
                  <Stack gap={2}>
                    {/* Never cut short: "Bản …" told nobody which state the
                        exam is in. The badge keeps the width of its words. */}
                    <Badge
                      color={EXAM_STATUS_COLORS[exam.status]}
                      variant="light"
                      radius="sm"
                      miw="max-content"
                    >
                      {isVi
                        ? EXAM_STATUS_LABELS[exam.status].vi
                        : EXAM_STATUS_LABELS[exam.status].en}
                    </Badge>
                    {exam.status === ExamStatus.PENDING_REVIEW && (
                      <Text size="sm" c="ink.5">
                        {tr("Gửi", "Sent")}{" "}
                        {formatDate(exam.submittedForReviewAt, isVi)}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td style={NO_WRAP}>
                  <Text size="sm" c="ink.7">
                    v{exam.versionNumber}
                  </Text>
                </Table.Td>
                <Table.Td style={NO_WRAP}>
                  <Text size="sm" c="ink.7">
                    {formatDate(exam.createdAt, isVi)}
                  </Text>
                </Table.Td>
                <Table.Td style={NO_WRAP}>
                  <Text size="sm" c="ink.7">
                    {formatDate(exam.publishedAt, isVi)}
                  </Text>
                </Table.Td>
                <Table.Td>{renderActions(exam)}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
