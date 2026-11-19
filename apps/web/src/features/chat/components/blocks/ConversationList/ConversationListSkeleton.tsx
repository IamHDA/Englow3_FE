import { Group, Skeleton, Stack } from "@mantine/core";

import classes from "./ConversationList.module.css";

/** A list of conversations on its way: picture, name and time, a line of preview. */
export function ConversationListSkeleton() {
  return (
    <Stack gap={0} aria-hidden="true">
      <Group gap="xs" px="md" py="sm" className={classes.header}>
        <Skeleton circle height={20} width={20} />
        <Skeleton height={24} width={110} radius="sm" />
      </Group>
      {Array.from({ length: 6 }, (_, row) => (
        <Group
          key={row}
          gap="sm"
          wrap="nowrap"
          px="md"
          py={12}
          className={classes.skeletonRow}
        >
          <Skeleton circle height={44} width={44} flex="none" />
          <Stack gap={8} flex={1}>
            <Group justify="space-between" wrap="nowrap">
              <Skeleton height={14} width={120} radius="sm" />
              <Skeleton height={10} width={36} radius="sm" />
            </Group>
            <Skeleton height={12} width="70%" radius="sm" />
          </Stack>
        </Group>
      ))}
    </Stack>
  );
}
