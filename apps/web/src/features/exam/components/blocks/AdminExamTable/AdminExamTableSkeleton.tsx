"use client";

import { Group, Skeleton, Stack } from "@mantine/core";

/** Số dòng giả - khớp một trang danh sách thường thấy, không phải cả trang 20. */
const PLACEHOLDER_ROWS = 8;

/**
 * Đứng thay bảng đề lúc đang tải. Cùng chiều cao dòng và cùng cột nên khi dữ
 * liệu về không có gì nhảy chỗ.
 */
export function AdminExamTableSkeleton() {
  return (
    <Stack gap={12}>
      <Skeleton height={36} radius="sm" />
      {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
        <Group key={index} gap="md" wrap="nowrap">
          <Skeleton height={44} radius="sm" style={{ flex: 3 }} />
          <Skeleton height={44} radius="sm" style={{ flex: 1 }} />
          <Skeleton height={44} radius="sm" style={{ flex: 1 }} />
          <Skeleton height={44} radius="sm" style={{ flex: 2 }} />
        </Group>
      ))}
    </Stack>
  );
}
