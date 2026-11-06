"use client";

import { Badge, Button, Group, Table, Text } from "@mantine/core";
import { EXAM_STATUS_COLORS, EXAM_STATUS_LABELS } from "@/features/exam";
import type { AdminFullTestFieldsFragment } from "@/lib/graphql/generated/documents";
import { ExamStatus } from "@/lib/graphql/generated/schemaTypes";
import { useLanguage } from "@/shared/hooks/useLanguage";

export type FullTestAction =
  "edit" | "submit" | "approve" | "reject" | "archive";

/** What can be done to a full test in each status, and by whom. */
function actionsFor(status: ExamStatus, canReview: boolean): FullTestAction[] {
  switch (status) {
    case ExamStatus.DRAFT:
    case ExamStatus.REJECTED:
      return ["edit", "submit"];
    case ExamStatus.PENDING_REVIEW:
      return canReview ? ["approve", "reject"] : [];
    case ExamStatus.PUBLISHED:
      return canReview ? ["archive"] : [];
    case ExamStatus.ARCHIVED:
      return [];
  }
}

const ACTION_COPY: Record<
  FullTestAction,
  { vi: string; en: string; color?: string; variant: string }
> = {
  edit: { vi: "Sửa", en: "Edit", variant: "default" },
  submit: { vi: "Gửi duyệt", en: "Submit for review", variant: "light" },
  approve: { vi: "Duyệt", en: "Approve", variant: "filled", color: "teal" },
  reject: { vi: "Trả lại", en: "Return", variant: "light", color: "yellow" },
  archive: { vi: "Lưu trữ", en: "Archive", variant: "subtle", color: "orange" },
};

export function AdminFullTestTable({
  fullTests,
  canReview,
  busyId,
  onAction,
}: {
  fullTests: AdminFullTestFieldsFragment[];
  canReview: boolean;
  busyId: string | null;
  onAction: (
    action: FullTestAction,
    fullTest: AdminFullTestFieldsFragment,
  ) => void;
}) {
  const { isVi } = useLanguage();
  return (
    <Table.ScrollContainer minWidth={720}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{isVi ? "Tên" : "Title"}</Table.Th>
            <Table.Th>{isVi ? "Loại" : "Variant"}</Table.Th>
            <Table.Th>{isVi ? "Trạng thái" : "Status"}</Table.Th>
            <Table.Th>{isVi ? "Thao tác" : "Actions"}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {fullTests.map((fullTest) => (
            <Table.Tr key={fullTest.id}>
              <Table.Td>
                <Text fw={600} size="sm">
                  {fullTest.title}
                </Text>
                {fullTest.reviewNote &&
                  fullTest.status === ExamStatus.REJECTED && (
                    <Text size="xs" c="yellow.8">
                      {isVi ? "Lý do trả lại: " : "Returned: "}
                      {fullTest.reviewNote}
                    </Text>
                  )}
              </Table.Td>
              <Table.Td>
                <Text size="sm">{fullTest.certificateVariant}</Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={EXAM_STATUS_COLORS[fullTest.status]}
                  variant="light"
                >
                  {isVi
                    ? EXAM_STATUS_LABELS[fullTest.status].vi
                    : EXAM_STATUS_LABELS[fullTest.status].en}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {actionsFor(fullTest.status, canReview).map((action) => (
                    <Button
                      key={action}
                      size="xs"
                      variant={ACTION_COPY[action].variant}
                      color={ACTION_COPY[action].color}
                      disabled={busyId !== null}
                      loading={busyId === fullTest.id && action !== "edit"}
                      onClick={() => onAction(action, fullTest)}
                    >
                      {isVi ? ACTION_COPY[action].vi : ACTION_COPY[action].en}
                    </Button>
                  ))}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
