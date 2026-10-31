"use client";

import { Grid, Skeleton, Stack } from "@mantine/core";
import React from "react";
import { Page } from "@/shared/components/Page";

export function DailyPathSkeleton() {
  return (
    <Page>
      <Stack gap="xl">
        <Skeleton height={180} radius="lg" />
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Skeleton height={420} radius="md" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={280} radius="md" />
          </Grid.Col>
        </Grid>
      </Stack>
    </Page>
  );
}
