import { Group, Skeleton, Stack } from "@mantine/core";

import { PostListSkeleton } from "../PostList/PostListSkeleton";

/** The posts of a wall on their way: the heading, and the first cards. */
export function WallPostsSkeleton() {
  return (
    <Stack gap="md" aria-hidden="true">
      <Group justify="space-between">
        <Skeleton height={26} width={90} radius="sm" />
        <Skeleton height={36} width={110} radius="md" />
      </Group>
      <PostListSkeleton count={2} />
    </Stack>
  );
}
