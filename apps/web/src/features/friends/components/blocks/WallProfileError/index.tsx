"use client";

import { Alert, Box, Button, Flex, Paper, Stack, Text } from "@mantine/core";
import { AlertCircle, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

import { WALL_COPY } from "../../../constants/friends";

type WallProfileErrorProps = {
  friendCount: number | null;
  actions: ReactNode;
  onRetry: () => void;
};

/**
 * The wall when only the profile failed to load: what else the page knows (the
 * friend count, the buttons) stays, and the profile gets a line and a retry.
 */
export function WallProfileError({
  friendCount,
  actions,
  onRetry,
}: WallProfileErrorProps) {
  return (
    <Stack gap="md">
      <Alert
        color="warn"
        radius="md"
        icon={<AlertCircle size={20} aria-hidden="true" />}
        title={WALL_COPY.profileErrorTitle}
      >
        {WALL_COPY.profileErrorDescription}
        <Button
          variant="light"
          color="warn"
          size="sm"
          mt="sm"
          display="block"
          leftSection={<RotateCw size={16} aria-hidden="true" />}
          onClick={onRetry}
        >
          {WALL_COPY.retry}
        </Button>
      </Alert>
      <Paper radius="lg" withBorder p="md">
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          gap="md"
        >
          {friendCount !== null && (
            <Text size="sm" fw={600} c="ink.8">
              {friendCount} {WALL_COPY.friendCountSuffix}
            </Text>
          )}
          <Box ml={{ sm: "auto" }}>{actions}</Box>
        </Flex>
      </Paper>
    </Stack>
  );
}
