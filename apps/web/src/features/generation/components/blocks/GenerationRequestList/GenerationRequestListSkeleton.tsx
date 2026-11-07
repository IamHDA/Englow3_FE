import { Card, Group, Skeleton, Stack } from "@mantine/core";

/** The generation page while it loads: the form, then request cards. */
export function GenerationRequestListSkeleton() {
  return (
    <Stack gap="lg">
      <Skeleton height={32} width="35%" />
      <Card withBorder radius="lg" p="lg">
        <Stack gap="sm">
          <Skeleton height={80} />
          <Group justify="space-between">
            <Skeleton height={14} width={180} />
            <Skeleton height={36} width={180} />
          </Group>
        </Stack>
      </Card>
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} withBorder radius="lg" p="lg">
          <Stack gap="sm">
            <Group justify="space-between">
              <Skeleton height={18} width="45%" />
              <Skeleton height={22} width={110} radius="xl" />
            </Group>
            <Skeleton height={8} />
            <Skeleton height={14} width="30%" />
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
