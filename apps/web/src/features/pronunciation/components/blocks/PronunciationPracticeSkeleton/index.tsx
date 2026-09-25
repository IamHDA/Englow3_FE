"use client";

import { Skeleton, Stack } from "@mantine/core";
import React from "react";
import { Page } from "@/shared/components/Page";

export function PronunciationPracticeSkeleton() {
  return (
    <Page width="focus">
      <Stack gap="xl">
        <Skeleton height={40} radius="md" />
        <Skeleton height={380} radius="lg" />
        <Skeleton height={140} radius="md" />
      </Stack>
    </Page>
  );
}
