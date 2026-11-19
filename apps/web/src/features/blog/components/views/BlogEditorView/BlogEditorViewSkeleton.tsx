import { Skeleton, Stack } from "@mantine/core";

import { PostEditorFormSkeleton } from "../../blocks/PostEditorForm/PostEditorFormSkeleton";

/** The editor page on its way: its heading and the form. */
export function BlogEditorViewSkeleton() {
  return (
    <Stack gap="lg" aria-hidden="true">
      <Skeleton height={34} width={200} radius="sm" />
      <PostEditorFormSkeleton />
    </Stack>
  );
}
