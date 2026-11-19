import { Group, Skeleton, SimpleGrid, Stack } from "@mantine/core";

import { PostListSkeleton } from "../../blocks/PostList/PostListSkeleton";

/** The posts page on its way: the heading and button, the search and filters, and the first cards. */
export function BlogListViewSkeleton() {
  return (
    <Stack gap="lg" aria-hidden="true">
      <Group justify="space-between">
        <Skeleton height={34} width={120} radius="sm" />
        <Skeleton height={36} width={120} radius="md" />
      </Group>
      <Skeleton height={16} width="55%" radius="sm" />
      <Stack gap="sm">
        <Skeleton height={36} radius="md" />
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <Skeleton height={36} radius="md" />
          <Skeleton height={36} radius="md" />
          <Skeleton height={36} radius="md" />
        </SimpleGrid>
        <Skeleton height={34} width={220} radius="md" />
      </Stack>
      <PostListSkeleton />
    </Stack>
  );
}
