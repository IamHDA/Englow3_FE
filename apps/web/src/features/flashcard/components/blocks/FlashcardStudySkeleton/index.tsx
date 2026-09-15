"use client";

import { Box, Container, Skeleton, Stack } from "@mantine/core";
import React from "react";

export function FlashcardStudySkeleton() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl" align="center">
        <Box w="100%">
          <Skeleton height={40} radius="md" />
        </Box>
        <Skeleton height={12} radius="xl" w="100%" />
        <Skeleton height={420} radius="lg" w="100%" maw={680} />
        <Skeleton height={50} radius="xl" w={260} />
      </Stack>
    </Container>
  );
}
