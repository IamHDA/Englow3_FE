import { Card, Divider, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";

export function ExamLibrarySkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
      {Array.from({ length: 8 }).map((_, idx) => (
        <Card key={idx} withBorder radius="lg" p="lg" mih={280}>
          <Group justify="space-between" align="center" mb="xs">
            <Skeleton height={24} width={60} radius="xl" />
            <Skeleton height={18} width={80} radius="xl" />
          </Group>

          <Stack gap={6}>
            <Skeleton height={12} width={90} radius="xs" />
            <Skeleton height={20} width="85%" radius="xs" />
          </Stack>

          <Group gap={6} mt="xs" mb="xs">
            <Skeleton height={20} width={64} radius="sm" />
            <Skeleton height={20} width={64} radius="sm" />
          </Group>

          <Stack gap="xs" mt="auto" pt="xs">
            <Divider color="gray.2" />

            <Group gap="md">
              <Skeleton height={16} width={70} radius="xs" />
              <Skeleton height={16} width={70} radius="xs" />
            </Group>

            <Group justify="space-between" align="center" pt={4}>
              <Skeleton height={24} width={80} radius="xs" />
              <Skeleton height={32} width={110} radius="xl" />
            </Group>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
