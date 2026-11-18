import { Flex, Group, Paper, Skeleton, Stack } from "@mantine/core";

import classes from "./WallSkeleton.module.css";

/** A wall on its way: banner, picture, name, join date and friend count, buttons. */
export function WallSkeleton() {
  return (
    <Paper radius="lg" withBorder className={classes.paper}>
      <Skeleton className={classes.banner} radius={0} />
      <Stack gap="md" p="xl" pt={0}>
        <Skeleton circle height={96} width={96} className={classes.avatar} />
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "stretch", sm: "flex-end" }}
          gap="md"
        >
          <Stack gap={10}>
            <Skeleton height={28} width={200} radius="sm" />
            <Group gap="md">
              <Skeleton height={16} width={120} radius="sm" />
              <Skeleton height={16} width={80} radius="sm" />
            </Group>
          </Stack>
          <Group gap="xs" wrap="nowrap">
            <Skeleton height={36} width={104} radius="md" />
            <Skeleton height={36} width={36} radius="md" />
          </Group>
        </Flex>
      </Stack>
    </Paper>
  );
}
