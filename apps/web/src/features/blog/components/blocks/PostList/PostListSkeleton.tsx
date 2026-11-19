import { Stack } from "@mantine/core";

import { PostCardSkeleton } from "../PostCard/PostCardSkeleton";

/** A list of posts on its way: as many cards as a page holds, so nothing jumps when they arrive. */
export function PostListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Stack gap="md" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </Stack>
  );
}
