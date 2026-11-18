import { Skeleton, Stack } from "@mantine/core";

import { FriendListSkeleton } from "../FriendList/FriendListSkeleton";

/** The /friends page on its way: title, the four tabs, the first list. */
export function FriendsSkeleton() {
  return (
    <Stack gap="lg">
      <Skeleton height={34} width={150} radius="sm" />
      <Skeleton height={44} radius="md" />
      <FriendListSkeleton />
    </Stack>
  );
}
