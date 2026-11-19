import { Group, Paper, Skeleton, Stack } from "@mantine/core";

/** The queue on its way: as many rows as a page holds, each badges, a line, reasons and the people. */
export function ModerationQueueListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Stack gap="sm" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Paper key={index} withBorder radius="md" p="md">
          <Stack gap="xs">
            <Group gap="xs">
              <Skeleton height={22} width={72} radius="xl" />
              <Skeleton height={22} width={96} radius="xl" />
              <Skeleton height={22} width={110} radius="xl" />
            </Group>
            <Skeleton height={18} width="70%" radius="sm" />
            <Skeleton height={14} width="50%" radius="sm" />
            <Group gap={6}>
              <Skeleton height={20} width={80} radius="sm" />
              <Skeleton height={20} width={96} radius="sm" />
            </Group>
            <Group justify="space-between">
              <Group gap="xs" wrap="nowrap">
                <Skeleton circle height={28} width={28} />
                <Skeleton height={14} width={100} radius="sm" />
              </Group>
              <Skeleton height={12} width={200} radius="sm" />
            </Group>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
