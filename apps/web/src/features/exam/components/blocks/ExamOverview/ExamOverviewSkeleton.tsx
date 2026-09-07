'use client';

import React from 'react';
import {
  Box,
  Card,
  Flex,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
} from '@mantine/core';

export function ExamOverviewSkeleton() {
  return (
    <Box py="xl" px={{ base: 'md', md: 'xl' }} maw={1100} mx="auto">
      {/* Breadcrumb Skeleton */}
      <Flex align="center" gap="xs" mb="lg">
        <Skeleton width={120} height={18} radius="xl" />
        <Skeleton width={10} height={18} radius="xl" />
        <Skeleton width={200} height={18} radius="xl" />
      </Flex>

      {/* Main Hero Card Skeleton */}
      <Card
        radius="lg"
        p={{ base: 'lg', md: 'xl' }}
        withBorder
        style={{
          backgroundColor: 'var(--mantine-color-white)',
          borderColor: 'var(--mantine-color-ink-2)',
        }}
      >
        <Stack gap="lg">
          {/* Header Badges Skeleton */}
          <Stack gap={10}>
            <Group gap="xs">
              <Skeleton width={90} height={26} radius="xl" />
              <Skeleton width={70} height={26} radius="xl" />
            </Group>
            <Skeleton width="60%" height={32} radius="md" />
            <Skeleton width="90%" height={16} radius="md" />
          </Stack>

          {/* Key Metrics Grid Skeleton */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                p="md"
                radius="md"
                style={{
                  backgroundColor: 'var(--mantine-color-ink-0)',
                  border: '1px solid var(--mantine-color-ink-2)',
                }}
              >
                <Group gap="xs">
                  <Skeleton width={36} height={36} radius="xl" />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton width="70%" height={12} radius="sm" />
                    <Skeleton width="90%" height={18} radius="sm" />
                  </Stack>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          {/* Section Breakdown Skeleton */}
          <Stack gap="xs">
            <Skeleton width={150} height={20} radius="sm" />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card
                  key={i}
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: 'var(--mantine-color-white)',
                    borderColor: 'var(--mantine-color-ink-2)',
                  }}
                >
                  <Group gap="xs" mb="xs">
                    <Skeleton width={32} height={32} radius="md" />
                    <Skeleton width={140} height={18} radius="sm" />
                  </Group>
                  <Skeleton width="80%" height={14} radius="sm" mb={4} />
                  <Skeleton width="50%" height={14} radius="sm" />
                </Card>
              ))}
            </SimpleGrid>
          </Stack>

          {/* Guidelines Box Skeleton */}
          <Box
            p="md"
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--mantine-color-ink-2)',
              borderRadius: 14,
            }}
          >
            <Skeleton width={220} height={20} radius="sm" mb="sm" />
            <Stack gap={10}>
              <Skeleton width="95%" height={14} radius="sm" />
              <Skeleton width="85%" height={14} radius="sm" />
              <Skeleton width="90%" height={14} radius="sm" />
            </Stack>
          </Box>

          {/* Action CTA Skeleton */}
          <Group justify="flex-end" pt="sm">
            <Skeleton width={130} height={40} radius="xl" />
            <Skeleton width={160} height={40} radius="xl" />
          </Group>
        </Stack>
      </Card>
    </Box>
  );
}
