import { Card, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { Page } from "@/shared/components/Page";

/** A sitting while it loads: the band card, then the six parts. */
export function FullTestSittingSkeleton() {
  return (
    <Page width="focus">
      <Stack gap="lg">
        <Skeleton height={36} width="55%" />
        <Card withBorder radius="lg" p="lg">
          <Stack gap="md">
            <Skeleton height={14} width="45%" />
            <Skeleton height={40} width={90} />
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} height={58} radius="md" />
              ))}
            </SimpleGrid>
          </Stack>
        </Card>
        <Stack gap="sm">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height={64} radius="md" />
          ))}
        </Stack>
      </Stack>
    </Page>
  );
}
