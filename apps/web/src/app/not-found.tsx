import { Button, Center, Stack, Text, Title } from "@mantine/core";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Không tìm thấy trang | Englow3",
};

/**
 * Replaces Next's default "404 | This page could not be found." - English,
 * unstyled, and with no way back. `component="a"` rather than Link: this is a
 * Server Component and cannot hand a function to a client one.
 */
export default function NotFound() {
  return (
    <Center mih="70vh" px="md">
      <Stack align="center" gap="md" maw={440} ta="center">
        <Image src="/englow3-mark.png" alt="" width={52} height={56} />
        <Text fz={56} fw={800} c="navy.9" lh={1}>
          404
        </Text>
        <Title order={1} fz={24} fw={700} c="navy.9">
          Không tìm thấy trang
        </Title>
        <Text c="ink.6">
          Trang bạn tìm không tồn tại hoặc đã được chuyển đi.
        </Text>
        <Button component="a" href="/" color="orange.5" radius="xl" size="md">
          Về trang chủ
        </Button>
      </Stack>
    </Center>
  );
}
