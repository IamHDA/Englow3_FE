import { Card, Group, Skeleton, Stack } from "@mantine/core";

/** The admin full test list while it loads: a header, then table rows. */
export function AdminFullTestTableSkeleton() {
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Skeleton height={32} width="35%" />
        <Skeleton height={36} width={150} />
      </Group>
      <Card withBorder radius="lg" p="md">
        <Stack gap="md">
          {Array.from({ length: 5 }, (_, index) => (
            <Group key={index} justify="space-between" wrap="nowrap">
              <Skeleton height={16} width="40%" />
              <Skeleton height={16} width={80} />
              <Skeleton height={22} width={100} radius="xl" />
              <Skeleton height={28} width={160} />
            </Group>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
