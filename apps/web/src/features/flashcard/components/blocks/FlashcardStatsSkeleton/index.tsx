"use client";

import { Card, Grid, Group, Skeleton, Stack } from "@mantine/core";
import React from "react";

/**
 * Chỗ giữ cho tab thống kê trong lúc chờ: cùng bố cục với trang thật (bộ chọn
 * khoảng thời gian, bốn thẻ số liệu, biểu đồ, bảng từ hay quên, lịch sử), để
 * nội dung hiện ra không làm trang nhảy. Trước đây là ba khối xám chung chung.
 */
export function FlashcardStatsSkeleton() {
  return (
    <Stack gap="lg" aria-busy="true" aria-live="polite">
      <Group justify="flex-end">
        <Skeleton height={36} width={300} radius="md" />
      </Group>

      <Grid gap="md">
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={8} style={{ flex: 1 }}>
                  <Skeleton height={10} width="70%" radius="sm" />
                  <Skeleton height={22} width="45%" radius="sm" />
                </Stack>
                <Skeleton height={36} width={36} radius="md" />
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Stack gap="md">
          <Skeleton height={14} width={180} radius="sm" />
          <Skeleton height={200} radius="md" />
        </Stack>
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Stack gap="sm">
          <Skeleton height={14} width={160} radius="sm" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={38} radius="sm" />
          ))}
        </Stack>
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Stack gap="sm">
          <Skeleton height={14} width={220} radius="sm" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={34} radius="sm" />
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
