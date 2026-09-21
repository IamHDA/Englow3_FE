"use client";

import { Badge, Button, Group, Stack, Table, Text } from "@mantine/core";
import { Archive, Send } from "lucide-react";

import {
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
  onPublish,
  onArchive,
}: AdminExamTableProps) {
  return (
    <Table.ScrollContainer minWidth={900}>
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
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {EXAM_TYPE_LABELS[exam.examType]}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={EXAM_STATUS_COLORS[exam.status]}
                    variant="light"
                    radius="sm"
                  >
                    {EXAM_STATUS_LABELS[exam.status]}
                  </Badge>
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
                    {/* Backend chỉ nhận publish từ bản nháp, archive từ bản
                        nháp hoặc đã phát hành - ẩn nút ở đây chỉ để đỡ bấm
                        nhầm, nó vẫn từ chối nếu gọi thẳng. */}
                    {exam.status === ExamStatus.DRAFT && (
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
                    {exam.status !== ExamStatus.ARCHIVED && (
                      <Button
                        size="xs"
                        radius="md"
                        variant="default"
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
