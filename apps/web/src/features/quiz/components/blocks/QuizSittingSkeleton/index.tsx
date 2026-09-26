"use client";

import { Container, Grid, Skeleton, Stack } from "@mantine/core";
import React from "react";

export function QuizSittingSkeleton() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Skeleton height={40} radius="md" />
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Skeleton height={380} radius="md" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={320} radius="md" />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
