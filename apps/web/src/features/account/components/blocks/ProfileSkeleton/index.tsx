import {
  Grid,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
} from "@mantine/core";

import classes from "./ProfileSkeleton.module.css";

export function ProfileSkeleton() {
  return (
    <Stack gap="lg" className={classes.container}>
      {/* Breadcrumb & Title skeleton */}
      <Stack gap="xs">
        <Skeleton height={18} width={200} radius="sm" />
        <Skeleton height={32} width={260} radius="sm" />
        <Skeleton height={16} width={380} radius="sm" />
      </Stack>

      <Grid gap="xl" align="flex-start">
        {/* Left Column (Span 4) */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <Paper radius="lg" withBorder className={classes.headerPaper}>
              <Skeleton height={130} radius="lg 1lg 0 0" className={classes.banner} />
              <Stack gap="md" p="xl" pt={0}>
                <Skeleton
                  circle
                  height={88}
                  width={88}
                  className={classes.avatarOverlap}
                />
                <Stack gap="xs">
                  <Skeleton height={24} width={180} radius="sm" />
                  <Skeleton height={16} width={120} radius="sm" />
                </Stack>
                <Skeleton height={1} />
                <Stack gap="xs">
                  <Skeleton height={18} radius="sm" />
                  <Skeleton height={18} radius="sm" />
                  <Skeleton height={18} radius="sm" />
                </Stack>
              </Stack>
            </Paper>

            <Paper radius="lg" withBorder p="lg">
              <Stack gap="md">
                <Skeleton height={22} width={150} radius="sm" />
                <SimpleGrid cols={2} spacing="xs">
                  <Skeleton height={60} radius="md" />
                  <Skeleton height={60} radius="md" />
                </SimpleGrid>
                <Skeleton height={36} radius="md" />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Right Column (Span 8) */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            {/* Tabs List Skeleton */}
            <Paper radius="md" withBorder p="xs">
              <SimpleGrid cols={3} spacing="xs">
                <Skeleton height={36} radius="sm" />
                <Skeleton height={36} radius="sm" />
                <Skeleton height={36} radius="sm" />
              </SimpleGrid>
            </Paper>

            {/* Form Card Skeleton */}
            <Paper radius="lg" withBorder p="xl">
              <Stack gap="lg">
                <Stack gap="xs">
                  <Skeleton height={24} width={180} radius="sm" />
                  <Skeleton height={16} width={280} radius="sm" />
                </Stack>

                <Skeleton height={1} />

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Stack gap="xs">
                    <Skeleton height={16} width={90} radius="sm" />
                    <Skeleton height={42} radius="md" />
                  </Stack>
                  <Stack gap="xs">
                    <Skeleton height={16} width={110} radius="sm" />
                    <Skeleton height={42} radius="md" />
                  </Stack>
                  <Stack gap="xs">
                    <Skeleton height={16} width={60} radius="sm" />
                    <Skeleton height={42} radius="md" />
                  </Stack>
                  <Stack gap="xs">
                    <Skeleton height={16} width={80} radius="sm" />
                    <Skeleton height={42} radius="md" />
                  </Stack>
                </SimpleGrid>

                <Stack gap="xs">
                  <Skeleton height={16} width={100} radius="sm" />
                  <Skeleton height={42} radius="md" />
                </Stack>

                <Skeleton height={1} />

                <Skeleton height={44} width={140} radius="md" ml="auto" />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
