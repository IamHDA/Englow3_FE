"use client";

import { Container, Paper, SimpleGrid, Skeleton, Stack } from "@mantine/core";

export function DictationStatsSkeleton() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Skeleton height={28} width={260} radius="md" />

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <Paper key={i} radius="md" p="md" withBorder>
              <Skeleton height={14} width={100} radius="sm" mb="xs" />
              <Skeleton height={32} width={60} radius="md" />
            </Paper>
          ))}
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Paper radius="md" p="lg" withBorder>
            <Skeleton height={180} width="100%" radius="md" />
          </Paper>
          <Paper radius="md" p="lg" withBorder>
            <Skeleton height={180} width="100%" radius="md" />
          </Paper>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
