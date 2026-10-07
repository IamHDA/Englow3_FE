"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Button, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function PageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return (
    <Stack align="center" p="xl" py={80} role="alert">
      <Title order={2}>
        {tr("Chưa mở được trang này", "This page did not open")}
      </Title>
      <Text ta="center">
        {tr(
          "Có lỗi khi tải trang. Bạn có thể thử lại hoặc trở về trang chủ.",
          "Something went wrong loading the page. Try again or go back home.",
        )}
      </Text>
      <Group>
        <Button onClick={reset}>{tr("Thử lại", "Try again")}</Button>
        <Button component={Link} href="/" variant="default">
          {tr("Về trang chủ", "Go home")}
        </Button>
      </Group>
    </Stack>
  );
}
