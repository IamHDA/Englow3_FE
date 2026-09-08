"use client";

import { Container, Skeleton, Stack } from "@mantine/core";
import React from "react";

export function PronunciationPracticeSkeleton() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Skeleton height={40} radius="md" />
        <Skeleton height={380} radius="lg" />
        <Skeleton height={140} radius="md" />
      </Stack>
    </Container>
  );
}
