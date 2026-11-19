import { Group, Skeleton, Stack } from "@mantine/core";

/** The editor on its way: title box, the two panes' tabs and the text box, the tag boxes, the buttons. */
export function PostEditorFormSkeleton() {
  return (
    <Stack gap="lg" aria-hidden="true">
      <Stack gap={6}>
        <Skeleton height={14} width={60} radius="sm" />
        <Skeleton height={42} radius="md" />
      </Stack>
      <Stack gap="sm">
        <Group justify="space-between">
          <Skeleton height={32} width={160} radius="sm" />
          <Skeleton height={32} width={120} radius="md" />
        </Group>
        <Skeleton height={340} radius="md" />
      </Stack>
      <Group gap="sm" grow>
        <Skeleton height={56} radius="md" />
        <Skeleton height={56} radius="md" />
        <Skeleton height={56} radius="md" />
      </Group>
      <Group justify="flex-end" gap="sm">
        <Skeleton height={36} width={80} radius="md" />
        <Skeleton height={36} width={120} radius="md" />
      </Group>
    </Stack>
  );
}
