"use client";

import { Container, Paper, SimpleGrid, Skeleton, Stack } from "@mantine/core";

export function DictationLibrarySkeleton() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header Skeleton */}
        <Stack gap="xs">
          <Skeleton height={14} width={200} radius="sm" />
          <Skeleton height={32} width={340} radius="md" />
          <Skeleton height={16} width={500} radius="sm" />
        </Stack>

        {/* Hero Card Skeleton */}
        <Paper radius="lg" p="xl" withBorder>
          <Stack gap="md">
            <Skeleton height={20} width={120} radius="sm" />
            <Skeleton height={28} width={280} radius="md" />
            <Skeleton height={12} width="100%" radius="xl" />
          </Stack>
        </Paper>

        {/* Filters Skeleton */}
        <Paper radius="md" p="sm" withBorder>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            <Skeleton height={36} radius="md" />
            <Skeleton height={36} radius="md" />
            <Skeleton height={36} radius="md" />
            <Skeleton height={36} radius="md" />
          </SimpleGrid>
        </Paper>

        {/* Lesson Cards Grid Skeleton */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Paper key={i} radius="md" p="lg" withBorder>
              <Stack gap="sm">
                <Skeleton height={18} width={100} radius="sm" />
                <Skeleton height={24} width="80%" radius="sm" />
                <Skeleton height={14} width="50%" radius="sm" />
                <Skeleton height={8} width="100%" radius="xl" mt="md" />
                <Skeleton height={36} width="100%" radius="md" />
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
