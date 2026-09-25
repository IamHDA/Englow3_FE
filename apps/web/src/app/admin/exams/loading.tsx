import { Stack } from "@mantine/core";

import { AdminExamTableSkeleton } from "@/features/exam";
import { Page } from "@/shared/components/Page";

export default function Loading() {
  return (
    <Page>
      <Stack gap="lg">
        <AdminExamTableSkeleton />
      </Stack>
    </Page>
  );
}
