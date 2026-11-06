import { Card, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { Page } from "@/shared/components/Page";

/** The full test library while it loads: a title, then a grid of test cards. */
export function FullTestLibrarySkeleton() {
  return (
    <Page>
      <Stack gap="lg">
        <Skeleton height={36} width="40%" />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} withBorder radius="lg" p="lg">
              <Stack gap="sm">
                <Skeleton height={20} width="70%" />
                <Skeleton height={14} />
                <Skeleton height={14} width="60%" />
                <Skeleton height={36} width={140} mt="sm" />
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Page>
  );
}
