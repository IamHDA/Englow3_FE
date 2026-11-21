import { Skeleton, Stack } from "@mantine/core";

import { PostRowListSkeleton } from "../../blocks/PostRowList/PostRowListSkeleton";

/** The saved posts on their way: the way back, the heading and a page of rows. */
export function BlogSavedViewSkeleton() {
  return (
    <Stack gap="lg" aria-hidden="true">
      <Skeleton height={28} width={150} radius="md" />
      <Stack gap={6}>
        <Skeleton height={34} width={120} radius="sm" />
        <Skeleton height={16} width="40%" radius="sm" />
      </Stack>
      <PostRowListSkeleton />
    </Stack>
  );
}
