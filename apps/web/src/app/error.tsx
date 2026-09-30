"use client";

import { Button, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function PageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Stack align="center" p="xl" py={80} role="alert">
      <Title order={2}>Chưa mở được trang này</Title>
      <Text ta="center">
        Có lỗi khi tải trang. Bạn có thể thử lại hoặc trở về trang chủ.
      </Text>
      <Group>
        <Button onClick={reset}>Thử lại</Button>
        <Button component={Link} href="/" variant="default">
          Về trang chủ
        </Button>
      </Group>
    </Stack>
  );
}
