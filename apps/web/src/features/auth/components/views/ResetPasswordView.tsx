"use client";

import { Center, Paper, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";

import { ResetPasswordForm } from "@/features/auth/components/blocks/ResetPasswordForm";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function ResetPasswordView() {
  const { isVi } = useLanguage();
  return (
    <Center flex={1} bg="ink.0" px="md" py="xl">
      <Paper
        radius={20}
        shadow="md"
        p={{ base: 28, sm: 40 }}
        w={420}
        maw="100%"
      >
        <Stack align="center" gap={10} mb={26}>
          <Image src="/englow3-mark.png" alt="Englow3" width={52} height={56} />
          <Title order={1} fz={27} fw={700} c="navy.9" ta="center">
            {isVi ? "Đặt lại mật khẩu" : "Reset password"}
          </Title>
          <Text fz={14} c="ink.7" ta="center">
            {isVi
              ? "Nhập mật khẩu mới cho tài khoản Englow3 của bạn"
              : "Enter a new password for your Englow3 account"}
          </Text>
        </Stack>
        <ResetPasswordForm />
      </Paper>
    </Center>
  );
}
