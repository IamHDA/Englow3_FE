"use client";

import { Container, Grid, Skeleton, Stack } from "@mantine/core";
import React from "react";

export function FlashcardDashboardSkeleton() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Skeleton height={50} radius="md" />
        <Skeleton height={160} radius="lg" />
        <Skeleton height={40} radius="md" />
        <Grid gap="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 4 }}>
              <Skeleton height={220} radius="md" />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
