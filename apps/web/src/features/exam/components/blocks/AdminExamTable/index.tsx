"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";

import { Badge, Button, Card, Group, Stack, Table, Text } from "@mantine/core";
import {
  Archive,
  ArchiveRestore,
  Check,
  Send,
  Undo2,
  Upload,
} from "lucide-react";

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
  const renderActions = (exam: AdminExamFieldsFragment) => {
    const busy = busyExamId === exam.id;
    const actions = EXAM_ACTIONS_BY_STATUS[exam.status];
    return (
      <Group gap="xs" justify="flex-end" wrap="wrap">
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
        {actions.submit && (
          <Button
            size="sm"
            radius="md"
            variant="light"
            loading={busy}
            leftSection={<Upload size={14} />}
            onClick={() => onSubmitForReview(exam.id)}
          >
            {tr("Gửi duyệt", "Submit")}
          </Button>
        )}
        {canReview && actions.approve && (
          <Button
            size="sm"
            radius="md"
            color="teal"
            loading={busy}
            leftSection={<Check size={14} />}
            onClick={() => onApprove(exam.id)}
          >
            {tr("Duyệt", "Approve")}
          </Button>
        )}
        {canReview && actions.reject && (
          <Button
            size="sm"
            radius="md"
            variant="default"
            loading={busy}
            leftSection={<Undo2 size={14} />}
            onClick={() => onReject(exam)}
          >
            {tr("Trả lại", "Return")}
          </Button>
        )}
        {canReview && actions.publish && (
          <Button
            size="sm"
            radius="md"
            loading={busy}
            leftSection={<Send size={14} />}
            onClick={() => onPublish(exam.id)}
          >
            {tr("Phát hành", "Publish")}
          </Button>
        )}
        {canReview && actions.restore && onRestore && (
          <Button
            size="sm"
            radius="md"
            variant="light"
            loading={busy}
            leftSection={<ArchiveRestore size={14} />}
            onClick={() => onRestore(exam.id)}
          >
            {tr("Khôi phục", "Restore")}
          </Button>
        )}
        {canReview && actions.archive && (
          <Button
            size="sm"
            radius="md"
            variant="subtle"
            color="gray"
            loading={busy}
            leftSection={<Archive size={14} />}
            onClick={() => {
              if (
                window.confirm(
                  tr(
                    `Lưu trữ “${exam.title}”? Nội dung sẽ ẩn khỏi thư viện; lịch sử và bài đã nộp vẫn được giữ.`,
                    `Archive “${exam.title}”? It leaves the library; history and submissions are kept.`,
                  ),
                )
              )
                onArchive(exam.id);
            }}
          >
            {tr("Lưu trữ", "Archive")}
          </Button>
        )}
      </Group>
    );
  };
  if (mobile)
    return (
      <Stack p="md">
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
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{tr("Đề thi", "Exam")}</Table.Th>
            <Table.Th>{tr("Loại", "Type")}</Table.Th>
            <Table.Th>{tr("Trạng thái", "Status")}</Table.Th>
            <Table.Th>{tr("Phiên bản", "Version")}</Table.Th>
            <Table.Th>{tr("Tạo lúc", "Created")}</Table.Th>
            <Table.Th>{tr("Phát hành", "Published")}</Table.Th>
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
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {isVi
                      ? EXAM_TYPE_LABELS[exam.examType].vi
                      : EXAM_TYPE_LABELS[exam.examType].en}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    <Badge
                      color={EXAM_STATUS_COLORS[exam.status]}
                      variant="light"
                      radius="sm"
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
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    v{exam.versionNumber}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {formatDate(exam.createdAt, isVi)}
                  </Text>
                </Table.Td>
                <Table.Td>
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
