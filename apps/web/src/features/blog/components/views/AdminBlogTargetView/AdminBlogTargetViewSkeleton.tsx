import { Group, Paper, Skeleton, Stack } from "@mantine/core";

import { ModerationQueueListSkeleton } from "../../blocks/ModerationQueueList/ModerationQueueListSkeleton";

/** A piece of reported content on its way: heading, badges, the content, the form, the reports. */
export function AdminBlogTargetViewSkeleton() {
  return (
    <Stack gap="lg" aria-hidden="true">
      <Skeleton height={28} width={150} radius="md" />
      <Skeleton height={34} width={240} radius="sm" />
      <Group gap="xs">
        <Skeleton height={22} width={72} radius="xl" />
        <Skeleton height={22} width={96} radius="xl" />
      </Group>
      <Paper withBorder radius="lg" p="xl">
        <Stack gap="md">
          <Skeleton height={22} width={120} radius="sm" />
          <Skeleton height={20} width="60%" radius="sm" />
          <Skeleton height={16} radius="sm" />
          <Skeleton height={16} radius="sm" />
          <Skeleton height={16} width="70%" radius="sm" />
        </Stack>
      </Paper>
      <Paper withBorder radius="lg" p="xl">
        <Stack gap="md">
          <Skeleton height={22} width={150} radius="sm" />
          <Skeleton height={56} radius="md" />
          <Skeleton height={96} radius="md" />
          <Skeleton height={36} width={110} radius="md" />
        </Stack>
      </Paper>
      <ModerationQueueListSkeleton count={2} />
    </Stack>
  );
}
