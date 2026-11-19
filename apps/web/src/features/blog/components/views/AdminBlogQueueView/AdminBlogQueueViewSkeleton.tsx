import { Group, Skeleton, Stack } from "@mantine/core";

import { ModerationQueueListSkeleton } from "../../blocks/ModerationQueueList/ModerationQueueListSkeleton";

/** The queue page on its way: heading, the tabs, the sort, and the first rows. */
export function AdminBlogQueueViewSkeleton() {
  return (
    <Stack gap="lg" aria-hidden="true">
      <Group justify="space-between">
        <Skeleton height={34} width={220} radius="sm" />
        <Skeleton height={36} width={150} radius="md" />
      </Group>
      <Skeleton height={16} width="45%" radius="sm" />
      <Skeleton height={38} radius="md" />
      <Skeleton height={34} width={320} radius="md" />
      <ModerationQueueListSkeleton />
    </Stack>
  );
}
