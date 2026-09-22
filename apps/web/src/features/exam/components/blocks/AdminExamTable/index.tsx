"use client";

import { Badge, Button, Group, Stack, Table, Text } from "@mantine/core";
import { Archive, Check, Send, Undo2, Upload } from "lucide-react";

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
};

function formatDate(value: string | null): string {
  if (value === null) return "—";
  return new Date(value).toLocaleDateString("vi-VN");
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
}: AdminExamTableProps) {
  return (
    <Table.ScrollContainer minWidth={980}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Đề thi</Table.Th>
            <Table.Th>Loại</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Phiên bản</Table.Th>
            <Table.Th>Tạo lúc</Table.Th>
            <Table.Th>Phát hành</Table.Th>
            <Table.Th ta="right">Thao tác</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {exams.map((exam) => {
            const busy = busyExamId === exam.id;
            const actions = EXAM_ACTIONS_BY_STATUS[exam.status];
            return (
              <Table.Tr key={exam.id}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm" fw={600} c="navy.9">
                      {exam.title}
                    </Text>
                    <Text size="xs" c="ink.5">
                      {exam.certificateType ?? "Không chứng chỉ"}
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
                        <Text size="xs" c="yellow.8" fs="italic">
                          Lý do: {exam.reviewNote}
                        </Text>
                      )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {EXAM_TYPE_LABELS[exam.examType]}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    <Badge
                      color={EXAM_STATUS_COLORS[exam.status]}
                      variant="light"
                      radius="sm"
                    >
                      {EXAM_STATUS_LABELS[exam.status]}
                    </Badge>
                    {exam.status === ExamStatus.PENDING_REVIEW && (
                      <Text size="xs" c="ink.5">
                        Gửi {formatDate(exam.submittedForReviewAt)}
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
                    {formatDate(exam.createdAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {formatDate(exam.publishedAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end" wrap="nowrap">
                    {actions.submit && (
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        loading={busy}
                        leftSection={<Upload size={14} />}
                        onClick={() => onSubmitForReview(exam.id)}
                      >
                        Gửi duyệt
                      </Button>
                    )}
                    {canReview && actions.approve && (
                      <Button
                        size="xs"
                        radius="md"
                        color="teal"
                        loading={busy}
                        leftSection={<Check size={14} />}
                        onClick={() => onApprove(exam.id)}
                      >
                        Duyệt
                      </Button>
                    )}
                    {canReview && actions.reject && (
                      <Button
                        size="xs"
                        radius="md"
                        variant="default"
                        loading={busy}
                        leftSection={<Undo2 size={14} />}
                        onClick={() => onReject(exam)}
                      >
                        Trả lại
                      </Button>
                    )}
                    {canReview && actions.publish && (
                      <Button
                        size="xs"
                        radius="md"
                        loading={busy}
                        leftSection={<Send size={14} />}
                        onClick={() => onPublish(exam.id)}
                      >
                        Phát hành
                      </Button>
                    )}
                    {canReview && actions.archive && (
                      <Button
                        size="xs"
                        radius="md"
                        variant="subtle"
                        color="gray"
                        loading={busy}
                        leftSection={<Archive size={14} />}
                        onClick={() => onArchive(exam.id)}
                      >
                        Lưu trữ
                      </Button>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
