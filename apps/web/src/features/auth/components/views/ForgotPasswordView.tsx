"use client";

import {
  Alert,
  Anchor,
  Center,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { ForgotPasswordForm } from "@/features/auth/components/blocks/ForgotPasswordForm";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/shared/hooks/useLanguage";

type ForgotPasswordViewProps = {
  /** Arrived here because a reset link had expired or was already used. */
  expired?: boolean;
};

async function sendResetLink(
  email: string,
  isVi: boolean,
): Promise<string | null> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
  });
  return error ? authErrorMessage(error, isVi) : null;
}

export function ForgotPasswordView({
  expired = false,
}: ForgotPasswordViewProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return (
    <Center mih="100vh" bg="ink.0" px="md" py="xl">
      <Paper
        radius={20}
        shadow="md"
        p={{ base: 28, sm: 40 }}
        w={440}
        maw="100%"
      >
        <Stack align="center" gap={10} mb={26}>
          <Image src="/englow3-mark.png" alt="Englow3" width={52} height={56} />
          <Title order={1} fz={27} fw={700} c="navy.9" ta="center">
            {tr("Quên mật khẩu", "Forgot password")}
          </Title>
          <Text fz={14} c="ink.7" ta="center">
            {tr(
              "Nhập email bạn dùng để đăng nhập. Chúng tôi sẽ gửi một link để bạn đặt mật khẩu mới.",
              "Enter the email you sign in with. We will send a link to set a new password.",
            )}
          </Text>
        </Stack>

        {expired && (
          <Alert
            color="orange"
            radius={12}
            mb={20}
            title={tr("Link đã hết hạn", "Link expired")}
          >
            {tr(
              "Link đặt lại mật khẩu chỉ dùng được một lần và trong 1 giờ. Nhập email để nhận link mới.",
              "A reset link works once, for 1 hour. Enter your email to get a new one.",
            )}
          </Alert>
        )}

        <ForgotPasswordForm onSend={(email) => sendResetLink(email, isVi)} />

        <Anchor
          component={Link}
          href="/"
          fz={14}
          fw={600}
          c="navy.9"
          mt={24}
          display="flex"
          style={{ alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {tr("Quay lại đăng nhập", "Back to sign in")}
        </Anchor>
      </Paper>
    </Center>
  );
}
