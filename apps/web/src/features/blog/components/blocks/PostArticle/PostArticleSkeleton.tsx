import { Divider, Group, Skeleton, Stack } from "@mantine/core";

/** A post on its way: title, author line, tags, a few paragraphs, an image, the like button. */
export function PostArticleSkeleton() {
  return (
    <Stack gap="lg" aria-hidden="true">
      <Stack gap="sm">
        <Skeleton height={34} width="85%" radius="sm" />
        <Skeleton height={34} width="45%" radius="sm" />
        <Group gap="md">
          <Group gap="xs" wrap="nowrap">
            <Skeleton circle height={32} width={32} />
            <Skeleton height={16} width={120} radius="sm" />
          </Group>
          <Skeleton height={12} width={72} radius="sm" />
        </Group>
        <Group gap={6}>
          <Skeleton height={20} width={64} radius="sm" />
          <Skeleton height={20} width={48} radius="sm" />
        </Group>
      </Stack>
      <Divider />
      <Stack gap={10}>
        <Skeleton height={16} radius="sm" />
        <Skeleton height={16} radius="sm" />
        <Skeleton height={16} width="92%" radius="sm" />
        <Skeleton height={16} width="70%" radius="sm" />
        <Skeleton height={220} radius="md" mt="sm" />
        <Skeleton height={16} radius="sm" mt="sm" />
        <Skeleton height={16} width="88%" radius="sm" />
      </Stack>
      <Divider />
      <Group gap="md">
        <Skeleton height={36} width={84} radius="md" />
        <Skeleton height={16} width={90} radius="sm" />
      </Group>
    </Stack>
  );
}
