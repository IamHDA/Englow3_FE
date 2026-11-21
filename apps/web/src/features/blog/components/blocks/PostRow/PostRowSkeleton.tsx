import { Flex, Group, Skeleton, Stack } from "@mantine/core";

/** A post row on its way: two tags, a title, two lines of excerpt, the byline and the bookmark. */
export function PostRowSkeleton() {
  return (
    <Flex gap="md" align="flex-start" py={24} aria-hidden="true">
      <Stack gap={10} flex={1} miw={0}>
        <Group gap={6}>
          <Skeleton height={20} width={64} radius="sm" />
          <Skeleton height={20} width={40} radius="sm" />
        </Group>
        <Skeleton height={28} width="70%" radius="sm" />
        <Stack gap={6}>
          <Skeleton height={16} radius="sm" />
          <Skeleton height={16} width="75%" radius="sm" />
        </Stack>
        <Group gap="xs">
          <Skeleton circle height={24} width={24} />
          <Skeleton height={14} width={200} radius="sm" />
        </Group>
      </Stack>
      <Skeleton height={44} width={44} radius="md" />
    </Flex>
  );
}
