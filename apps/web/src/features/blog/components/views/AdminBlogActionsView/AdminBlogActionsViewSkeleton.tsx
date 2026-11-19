import { Group, Paper, Skeleton, Stack } from "@mantine/core";

/** The history on its way: a few entries, each a badge, a reason and who did it. */
export function AdminBlogActionsViewSkeleton({
  count = 5,
}: {
  count?: number;
}) {
  return (
    <Stack gap="sm" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Paper key={index} withBorder radius="md" p="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Skeleton height={22} width={110} radius="xl" />
              <Skeleton height={12} width={110} radius="sm" />
            </Group>
            <Skeleton height={14} width="75%" radius="sm" />
            <Group justify="space-between">
              <Group gap="xs" wrap="nowrap">
                <Skeleton circle height={24} width={24} />
                <Skeleton height={14} width={100} radius="sm" />
              </Group>
              <Skeleton height={14} width={90} radius="sm" />
            </Group>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
