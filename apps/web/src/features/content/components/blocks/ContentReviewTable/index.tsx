"use client";

import { Badge, Button, Group, Stack, Table, Text } from "@mantine/core";
import { Archive, Check, Send, Undo2, Upload } from "lucide-react";

import { ContentKind, ContentStatus } from "@/lib/graphql/generated";
import {
  CONTENT_ACTIONS_BY_STATUS,
  CONTENT_ITEM_LABELS,
  CONTENT_STATUS_COLORS,
  CONTENT_STATUS_LABELS,
} from "../../../constants/adminContent";
import type { ContentReviewItem } from "../../../types";

type ContentReviewTableProps = {
  kind: ContentKind;
  items: ContentReviewItem[];
  /** Id của mục đang có thao tác chạy dở - chỉ khoá nút của đúng dòng đó. */
  busyId: string | null;
  /**
   * Tài khoản đang xem có quyền duyệt hay không. Nhân viên nội dung chỉ gửi
   * duyệt; duyệt, trả lại, phát hành và lưu trữ là của quản trị.
   */
  canReview: boolean;
  onSubmitForReview: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (item: ContentReviewItem) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
};

function formatDate(value: string | null): string {
  if (value === null) return "—";
  return new Date(value).toLocaleDateString("vi-VN");
}

export function ContentReviewTable({
  kind,
  items,
  busyId,
  canReview,
  onSubmitForReview,
  onApprove,
  onReject,
  onPublish,
  onArchive,
}: ContentReviewTableProps) {
  const itemLabel = CONTENT_ITEM_LABELS[kind];

  return (
    <Table.ScrollContainer minWidth={900}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tên</Table.Th>
            <Table.Th>Nội dung</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Tạo lúc</Table.Th>
            <Table.Th>Phát hành</Table.Th>
            <Table.Th ta="right">Thao tác</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => {
            const busy = busyId === item.id;
            const actions = CONTENT_ACTIONS_BY_STATUS[item.status];
            return (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm" fw={600} c="navy.9">
                      {item.title}
                    </Text>
                    <Text size="xs" c="ink.5">
                      {item.slug}
                    </Text>
                    {/*
                      Lý do trả lại hiện ngay ở dòng: đây là nơi người soạn biết
                      bài của mình bị trả và phải sửa gì.
                    */}
                    {item.status === ContentStatus.REJECTED &&
                      item.reviewNote !== null && (
                        <Text size="xs" c="yellow.8" fs="italic">
                          Lý do: {item.reviewNote}
                        </Text>
                      )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  {/*
                    Gạch ngang khi loại nội dung này không có gì để đếm - câu
                    luyện nói là một câu, không phải một tập hợp.
                  */}
                  <Text size="sm" c={item.itemCount === 0 ? "warn.7" : "ink.7"}>
                    {item.itemCount === null || itemLabel === null
                      ? "—"
                      : `${item.itemCount} ${itemLabel}`}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    <Badge
                      color={CONTENT_STATUS_COLORS[item.status]}
                      variant="light"
                      radius="sm"
                      // A narrow column cut "BẢN NHÁP" to "BẢN ...".
                      style={{ flexShrink: 0 }}
                      styles={{ label: { overflow: "visible" } }}
                    >
                      {CONTENT_STATUS_LABELS[item.status]}
                    </Badge>
                    {item.status === ContentStatus.PENDING_REVIEW && (
                      <Text size="xs" c="ink.5">
                        Gửi {formatDate(item.submittedForReviewAt)}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {formatDate(item.createdAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {formatDate(item.publishedAt)}
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
                        onClick={() => onSubmitForReview(item.id)}
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
                        onClick={() => onApprove(item.id)}
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
                        onClick={() => onReject(item)}
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
                        onClick={() => onPublish(item.id)}
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
                        onClick={() => onArchive(item.id)}
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
