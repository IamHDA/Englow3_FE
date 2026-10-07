import { Container, Skeleton, Stack, Text } from "@mantine/core";

export default function Loading() {
  return (
    <Container size="xl" py="xl">
      <Stack role="status" aria-live="polite">
        <Text fw={700}>Writing & Speaking</Text>
        <Text c="dimmed">Đang mở trang quản lý…</Text>
        <Skeleton h={42} radius="md" />
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} h={96} radius="md" />
        ))}
      </Stack>
    </Container>
  );
}
