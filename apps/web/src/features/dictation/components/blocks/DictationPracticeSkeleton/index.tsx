"use client";

import { Container, Paper, Skeleton, Stack } from "@mantine/core";

export function DictationPracticeSkeleton() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        {/* Top bar */}
        <Paper radius="md" p="md" withBorder>
          <Stack gap="xs">
            <Skeleton height={20} width={220} radius="sm" />
            <Skeleton height={14} width={140} radius="sm" />
          </Stack>
        </Paper>

        {/* Player skeleton */}
        <Paper radius="md" p="lg" withBorder>
          <Stack gap="md">
            <Skeleton height={48} width="100%" radius="sm" />
            <Skeleton height={52} width={52} radius="xl" style={{ margin: "0 auto" }} />
          </Stack>
        </Paper>

        {/* Input skeleton */}
        <Paper radius="md" p="lg" withBorder>
          <Stack gap="sm">
            <Skeleton height={96} width="100%" radius="md" />
            <Skeleton height={36} width={160} radius="md" style={{ alignSelf: "flex-end" }} />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
