import { Skeleton, Stack } from "@mantine/core";

/** The moderation form on its way: the choices, the reason box, the button. */
export function ModerationActionFormSkeleton() {
  return (
    <Stack gap="md" aria-hidden="true">
      <Stack gap="xs">
        <Skeleton height={14} width={80} radius="sm" />
        <Skeleton height={40} radius="md" />
        <Skeleton height={40} radius="md" />
      </Stack>
      <Stack gap="xs">
        <Skeleton height={14} width={260} radius="sm" />
        <Skeleton height={96} radius="md" />
      </Stack>
      <Skeleton height={36} width={110} radius="md" />
    </Stack>
  );
}
