import { Box, Flex, Group, Paper, Skeleton, Stack } from "@mantine/core";

import { PostRowListSkeleton } from "../../blocks/PostRowList/PostRowListSkeleton";
import { RecommendedPostsSkeleton } from "../../blocks/RecommendedPosts/RecommendedPostsSkeleton";

import classes from "./BlogListView.module.css";

/** The posts page on its way, in the shape it will have: the grey panel, the topics, and the list beside its column. */
export function BlogListViewSkeleton() {
  return (
    <Stack gap="lg" aria-hidden="true">
      <Paper bg="ink.0" withBorder className={classes.hero}>
        <Stack gap="lg">
          <Stack gap={6}>
            <Skeleton height={34} width={120} radius="sm" />
            <Skeleton height={16} width="45%" radius="sm" />
          </Stack>
          <Flex gap="sm" wrap="wrap" align="center">
            <Skeleton height={50} flex="1 1 360px" radius="lg" />
            <Skeleton height={50} width={120} radius="md" />
            <Skeleton height={50} width={120} radius="md" />
          </Flex>
          <RecommendedPostsSkeleton />
        </Stack>
      </Paper>

      <Group gap="xs" wrap="nowrap">
        {[72, 64, 64, 64, 64, 88, 88].map((width, index) => (
          <Skeleton key={index} height={36} width={width} radius="xl" />
        ))}
      </Group>

      <Flex
        direction={{ base: "column", md: "row-reverse" }}
        gap={{ base: "xl", md: 48 }}
        align={{ md: "flex-start" }}
      >
        <Box w={{ base: "100%", md: 280 }} flex="none">
          <Stack gap="xl">
            <Stack gap="sm">
              <Skeleton height={14} width={80} radius="sm" />
              <Skeleton height={36} width={220} radius="md" />
            </Stack>
            <Stack gap="sm">
              <Skeleton height={14} width={80} radius="sm" />
              <Group gap="xs">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Skeleton key={index} height={36} width={48} radius="md" />
                ))}
              </Group>
            </Stack>
          </Stack>
        </Box>
        <Stack gap="sm" flex={1} miw={0}>
          <Skeleton height={28} width={200} radius="sm" />
          <PostRowListSkeleton />
        </Stack>
      </Flex>
    </Stack>
  );
}
