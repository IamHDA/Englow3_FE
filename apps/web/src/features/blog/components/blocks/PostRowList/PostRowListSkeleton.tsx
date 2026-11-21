import { Divider, Stack } from "@mantine/core";

import { PostRowSkeleton } from "../PostRow/PostRowSkeleton";

/** The rows of a list on their way: as many as a page holds, so nothing jumps when they arrive. */
export function PostRowListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Stack gap={0} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Stack gap={0} key={index}>
          <PostRowSkeleton />
          <Divider />
        </Stack>
      ))}
    </Stack>
  );
}
