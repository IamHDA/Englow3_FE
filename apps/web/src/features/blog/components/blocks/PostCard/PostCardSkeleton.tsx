import { Group, Paper, Skeleton, Stack } from "@mantine/core";

/** A post card on its way: author line, title, three lines of excerpt, tags, counts. */
export function PostCardSkeleton() {
  return (
    <Paper withBorder radius="lg" p="lg" aria-hidden="true">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Skeleton circle height={28} width={28} />
            <Skeleton height={14} width={110} radius="sm" />
          </Group>
          <Skeleton height={12} width={70} radius="sm" />
        </Group>
        <Skeleton height={24} width="70%" radius="sm" />
        <Stack gap={6}>
          <Skeleton height={14} radius="sm" />
          <Skeleton height={14} radius="sm" />
          <Skeleton height={14} width="60%" radius="sm" />
        </Stack>
        <Group gap={6}>
          <Skeleton height={20} width={64} radius="sm" />
          <Skeleton height={20} width={48} radius="sm" />
        </Group>
        <Group gap="lg">
          <Skeleton height={14} width={90} radius="sm" />
          <Skeleton height={14} width={90} radius="sm" />
        </Group>
      </Stack>
    </Paper>
  );
}
