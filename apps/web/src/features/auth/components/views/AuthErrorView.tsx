"use client";

import {
  Anchor,
  Button,
  Center,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function AuthErrorView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return (
    <Center flex={1} bg="ink.0" px="md" py="xl">
      <Paper
        radius={20}
        shadow="md"
        p={{ base: 28, sm: 40 }}
        w={440}
        maw="100%"
      >
        <Stack gap="md">
          <Title order={1} fz={27} c="navy.9">
            {tr("Chưa thể xác thực tài khoản", "Could not verify your account")}
          </Title>
          <Text c="ink.7">
            {tr(
              "Liên kết có thể đã hết hạn, đã được dùng hoặc lần đăng nhập đã bị hủy. Hãy mở liên kết mới nhất trên cùng trình duyệt đã yêu cầu email.",
              "The link may have expired, been used, or sign-in was cancelled. Open the latest link in the same browser that requested the email.",
            )}
          </Text>
          <Button component={Link} href="/auth/forgot" color="teal">
            {tr("Nhận link đặt mật khẩu mới", "Get a new password link")}
          </Button>
          <Anchor component={Link} href="/" ta="center" c="navy.9">
            {tr("Quay lại đăng nhập", "Back to sign in")}
          </Anchor>
          <Text size="sm" c="ink.7">
            {tr(
              "Cần xác nhận đăng ký? Đăng nhập bằng email để yêu cầu gửi lại thư xác nhận.",
              "Need to confirm registration? Sign in with your email to request another confirmation email.",
            )}
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
