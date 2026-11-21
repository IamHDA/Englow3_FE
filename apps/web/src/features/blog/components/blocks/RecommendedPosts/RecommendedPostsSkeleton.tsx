import { Divider, Flex, Group, Paper, Skeleton, Stack } from "@mantine/core";

/** The recommendations on their way: the heading, one large card and two small, as they will be. */
export function RecommendedPostsSkeleton() {
  return (
    <Stack gap="md" aria-hidden="true">
      <Group gap="sm" wrap="nowrap">
        <Skeleton height={14} width={120} radius="sm" />
        <Divider flex={1} />
      </Group>
      <Flex gap="lg" wrap="wrap" align="stretch">
        <Paper
          withBorder
          radius={20}
          p={{ base: "lg", md: 32 }}
          flex="999 1 520px"
          miw={0}
        >
          <Stack gap="md">
            <Skeleton height={16} width="45%" radius="sm" />
            <Skeleton height={40} width="85%" radius="sm" />
            <Stack gap={8}>
              <Skeleton height={18} radius="sm" />
              <Skeleton height={18} radius="sm" />
              <Skeleton height={18} width="60%" radius="sm" />
            </Stack>
            <Group gap={6}>
              <Skeleton height={20} width={64} radius="sm" />
              <Skeleton height={20} width={40} radius="sm" />
            </Group>
          </Stack>
        </Paper>
        <Stack gap="md" flex="1 1 300px" maw={{ md: 400 }} miw={0}>
          {[0, 1].map((index) => (
            <Paper key={index} withBorder radius="xl" px={22} py={20} flex={1}>
              <Stack gap={10}>
                <Skeleton height={14} width="60%" radius="sm" />
                <Skeleton height={22} radius="sm" />
                <Skeleton height={14} width="80%" radius="sm" />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Flex>
    </Stack>
  );
}
