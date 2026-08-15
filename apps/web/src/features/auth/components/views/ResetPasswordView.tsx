import { Center, Paper, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";

import { ResetPasswordForm } from "@/features/auth/components/blocks/ResetPasswordForm";

export function ResetPasswordView() {
  return (
    <Center mih="100vh" bg="ink.0" px="md">
      <Paper radius={20} shadow="md" p={40} w={420} maw="100%">
        <Stack align="center" gap={10} mb={26}>
          <Image src="/englow3-mark.png" alt="Englow3" width={52} height={56} />
          <Title order={1} fz={27} fw={700} c="navy.9" ta="center">
            Đặt lại mật khẩu
          </Title>
          <Text fz={14} c="ink.7" ta="center">
            Nhập mật khẩu mới cho tài khoản Englow3 của bạn
          </Text>
        </Stack>
        <ResetPasswordForm />
      </Paper>
    </Center>
  );
}
