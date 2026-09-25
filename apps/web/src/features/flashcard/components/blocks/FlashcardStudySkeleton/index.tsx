"use client";

import { Box, Skeleton, Stack } from "@mantine/core";
import React from "react";
import { Page } from "@/shared/components/Page";

export function FlashcardStudySkeleton() {
  return (
    <Page width="focus">
      <Stack gap="xl" align="center">
        <Box w="100%">
          <Skeleton height={40} radius="md" />
        </Box>
        <Skeleton height={12} radius="xl" w="100%" />
        <Skeleton height={420} radius="lg" w="100%" maw={680} />
        <Skeleton height={50} radius="xl" w={260} />
      </Stack>
    </Page>
  );
}
