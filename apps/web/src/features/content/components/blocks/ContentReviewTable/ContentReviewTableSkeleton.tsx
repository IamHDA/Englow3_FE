"use client";

import { Skeleton, Stack } from "@mantine/core";

/** Số dòng khớp trang mặc định của danh sách, để khung không nhảy khi dữ liệu về. */
const PLACEHOLDER_ROWS = 6;

export function ContentReviewTableSkeleton() {
  return (
    <Stack gap="sm">
      <Skeleton height={28} radius="sm" />
      {Array.from({ length: PLACEHOLDER_ROWS }).map((_, index) => (
        <Skeleton key={index} height={52} radius="sm" />
      ))}
    </Stack>
  );
}
