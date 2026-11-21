import { Skeleton, Stack } from "@mantine/core";

import { FriendsLayout } from "../FriendsLayout";
import { PeoplePanelSkeleton } from "../PeoplePanel/PeoplePanelSkeleton";
import { FriendListSkeleton } from "../../parts/FriendListSkeleton";

/**
 * The /friends page on its way: title and subtitle, the search box and the
 * four menu rows on the left, the first list on the right.
 */
export function FriendsSkeleton() {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Skeleton height={36} width={150} radius="sm" />
        <Skeleton height={26} maw="100%" w={460} radius="sm" />
      </Stack>
      <FriendsLayout
        sidebar={
          <Stack gap="md">
            <Skeleton height={44} radius="md" />
            <Stack gap={4}>
              {Array.from({ length: 4 }, (_, row) => (
                // The menu's rows are 48px tall (see FriendsNav).
                <Skeleton key={row} height={48} radius="md" />
              ))}
            </Stack>
          </Stack>
        }
      >
        <PeoplePanelSkeleton>
          <FriendListSkeleton />
        </PeoplePanelSkeleton>
      </FriendsLayout>
    </Stack>
  );
}
