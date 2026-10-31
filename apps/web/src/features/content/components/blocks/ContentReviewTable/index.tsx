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
  /** Admin only; shown for archived rows. */
  onRestore?: (id: string) => void;
};

function formatDate(value: string | null, isVi = true): string {
  if (value === null) return "—";
  return new Date(value).toLocaleDateString(isVi ? "vi-VN" : "en-GB");
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
  onRestore,
}: ContentReviewTableProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const itemLabel = CONTENT_ITEM_LABELS[kind];

  const mobile = useMediaQuery("(max-width: 47.99em)");
  const renderActions = (item: ContentReviewItem) => {
    const busy = busyId === item.id;
    const actions = CONTENT_ACTIONS_BY_STATUS[item.status];
    return (
      <Group gap="xs" justify="flex-end" wrap="wrap">
        <Button
          component={Link}
          href={`/admin/content/editor/${kind}/${item.id}`}
          variant="default"
          size="sm"
        >
          {item.status === "DRAFT" || item.status === "REJECTED"
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
            onClick={() => onSubmitForReview(item.id)}
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
            onClick={() => onApprove(item.id)}
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
            onClick={() => onReject(item)}
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
            onClick={() => onPublish(item.id)}
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
            onClick={() => onRestore(item.id)}
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
                    `Lưu trữ “${item.title}”? Nội dung sẽ ẩn khỏi thư viện; lịch sử và bài đã nộp vẫn được giữ.`,
                    `Archive “${item.title}”? It leaves the library; history and submissions are kept.`,
                  ),
                )
              )
                onArchive(item.id);
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
        {items.map((item) => (
          <Card key={item.id} withBorder>
            <Stack gap="sm">
              <Text fw={700} style={{ overflowWrap: "anywhere" }}>
                {item.title}
              </Text>
              <Badge color={CONTENT_STATUS_COLORS[item.status]} w="fit-content">
                {isVi
                  ? CONTENT_STATUS_LABELS[item.status].vi
                  : CONTENT_STATUS_LABELS[item.status].en}
              </Badge>
              {item.reviewNote && (
                <Text size="sm" c="orange">
                  {item.reviewNote}
                </Text>
              )}
              <Text size="sm" c="dimmed">
                {formatDate(item.createdAt, isVi)}
              </Text>
              {renderActions(item)}
            </Stack>
          </Card>
        ))}
      </Stack>
    );

  return (
    <Table.ScrollContainer minWidth={900}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{tr("Tên", "Name")}</Table.Th>
            <Table.Th>{tr("Nội dung", "Items")}</Table.Th>
            <Table.Th>{tr("Trạng thái", "Status")}</Table.Th>
            <Table.Th>{tr("Tạo lúc", "Created")}</Table.Th>
            <Table.Th>{tr("Phát hành", "Published")}</Table.Th>
            <Table.Th ta="right">{tr("Thao tác", "Actions")}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => {
            return (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm" fw={600} c="navy.9">
                      {item.title}
                    </Text>
                    <Text size="sm" c="ink.5">
                      {item.slug}
                    </Text>
                    {/*
                      Lý do trả lại hiện ngay ở dòng: đây là nơi người soạn biết
                      bài của mình bị trả và phải sửa gì.
                    */}
                    {item.status === ContentStatus.REJECTED &&
                      item.reviewNote !== null && (
                        <Text size="sm" c="yellow.8" fs="italic">
                          {tr("Lý do", "Reason")}: {item.reviewNote}
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
                      : `${item.itemCount} ${isVi ? itemLabel.vi : itemLabel.en}`}
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
                      {isVi
                        ? CONTENT_STATUS_LABELS[item.status].vi
                        : CONTENT_STATUS_LABELS[item.status].en}
                    </Badge>
                    {item.status === ContentStatus.PENDING_REVIEW && (
                      <Text size="sm" c="ink.5">
                        {tr("Gửi", "Sent")}{" "}
                        {formatDate(item.submittedForReviewAt, isVi)}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {formatDate(item.createdAt, isVi)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="ink.7">
                    {formatDate(item.publishedAt, isVi)}
                  </Text>
                </Table.Td>
                <Table.Td>{renderActions(item)}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
