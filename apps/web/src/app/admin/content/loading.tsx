import { Container, Skeleton, Stack } from "@mantine/core";

export default function Loading() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Skeleton height={56} radius="md" />
        <Skeleton height={44} radius="md" />
        <Skeleton height={96} radius="lg" />
        <Skeleton height={420} radius="lg" />
      </Stack>
    </Container>
  );
}
