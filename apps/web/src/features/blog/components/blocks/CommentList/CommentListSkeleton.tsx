import { Group, Paper, Skeleton, Stack } from "@mantine/core";

/** The comments of a page on their way: a few cards, each an author line and two lines of text. */
export function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Stack gap="sm" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Paper key={index} withBorder radius="md" p="md">
          <Stack gap="xs">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <Skeleton circle height={28} width={28} />
                <Skeleton height={14} width={100} radius="sm" />
              </Group>
              <Skeleton height={12} width={64} radius="sm" />
            </Group>
            <Skeleton height={14} radius="sm" />
            <Skeleton height={14} width="65%" radius="sm" />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
