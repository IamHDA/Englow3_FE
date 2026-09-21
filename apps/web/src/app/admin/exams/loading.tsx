import { Container, Stack } from "@mantine/core";

import { AdminExamTableSkeleton } from "@/features/exam";

export default function Loading() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <AdminExamTableSkeleton />
      </Stack>
    </Container>
  );
}
