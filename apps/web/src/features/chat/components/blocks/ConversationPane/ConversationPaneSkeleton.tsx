import { Group, Skeleton, Stack } from "@mantine/core";

import { MessageListSkeleton } from "../MessageList/MessageListSkeleton";

/** A conversation on its way: the person's picture and name, the messages, and the box. */
export function ConversationPaneSkeleton() {
  return (
    <Stack gap={0} h="100%" aria-hidden="true">
      <Group gap="sm" px="md" py="sm">
        <Skeleton circle height={40} width={40} />
        <Skeleton height={18} width={160} radius="sm" />
      </Group>
      <Stack flex={1} mih={0} justify="flex-end">
        <MessageListSkeleton />
      </Stack>
      <Group gap="xs" p="sm" wrap="nowrap">
        <Skeleton height={44} width={44} radius="md" />
        <Skeleton height={44} radius="md" flex={1} />
        <Skeleton height={44} width={44} radius="md" />
      </Group>
    </Stack>
  );
}
