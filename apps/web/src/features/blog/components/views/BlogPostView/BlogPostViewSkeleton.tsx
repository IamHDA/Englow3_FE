import { Divider, Skeleton, Stack } from "@mantine/core";

import { CommentListSkeleton } from "../../blocks/CommentList/CommentListSkeleton";
import { PostArticleSkeleton } from "../../blocks/PostArticle/PostArticleSkeleton";

/** A post page on its way: the way back, the post, and its comments. */
export function BlogPostViewSkeleton() {
  return (
    <Stack gap="xl" aria-hidden="true">
      <Skeleton height={28} width={170} radius="md" />
      <PostArticleSkeleton />
      <Divider />
      <Stack gap="md">
        <Skeleton height={24} width={140} radius="sm" />
        <Skeleton height={96} radius="md" />
        <CommentListSkeleton count={2} />
      </Stack>
    </Stack>
  );
}
