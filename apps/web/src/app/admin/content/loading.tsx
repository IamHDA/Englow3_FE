import { Skeleton, Stack } from "@mantine/core";
import { Page } from "@/shared/components/Page";

export default function Loading() {
  return (
    <Page>
      <Stack gap="lg">
        <Skeleton height={56} radius="md" />
        <Skeleton height={44} radius="md" />
        <Skeleton height={96} radius="lg" />
        <Skeleton height={420} radius="lg" />
      </Stack>
    </Page>
  );
}
