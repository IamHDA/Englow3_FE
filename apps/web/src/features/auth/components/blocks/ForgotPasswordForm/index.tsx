"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Flex, Stack, Text, TextInput } from "@mantine/core";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** Supabase will not send another link to the same address for a minute. */
const RESEND_COOLDOWN_SECONDS = 60;

type ForgotPasswordFormProps = {
  /**
   * Sends the reset link. Resolves to an error message to show, or null when
   * the link went out. The view makes the call; this block only asks for it.
   */
  onSend: (email: string) => Promise<string | null>;
};

export function ForgotPasswordForm({ onSend }: ForgotPasswordFormProps) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function send(email: string) {
    setSendError(null);
    const error = await onSend(email);
    if (error) {
      setSendError(error);
      return;
    }
    setSentTo(email);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function resend() {
    if (!sentTo) return;
    setResending(true);
    await send(sentTo);
    setResending(false);
  }

  if (sentTo) {
    return (
      <Stack gap={18} align="stretch">
        <Alert
          color="teal"
          radius={12}
          icon={<MailCheck size={20} aria-hidden="true" />}
          title="Đã gửi link đặt lại mật khẩu"
        >
          {/* Supabase answers the same whether or not the address has an
              account, so this does not claim that it does. */}
          Nếu <b>{sentTo}</b> đã đăng ký Englow3, thư sẽ tới trong vài phút.
          Link có hiệu lực trong 1 giờ và chỉ dùng được một lần.
        </Alert>
        <Text fz={13} c="ink.6">
          Không thấy thư? Kiểm tra thư mục Spam hoặc Quảng cáo, hoặc gửi lại.
        </Text>
        {sendError && (
          <Text fz={13} c="warn.7" role="alert">
            {sendError}
          </Text>
        )}
        <Button
          variant="default"
          radius={12}
          h={44}
          onClick={() => void resend()}
          loading={resending}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Gửi lại sau ${cooldown} giây` : "Gửi lại link"}
        </Button>
      </Stack>
    );
  }

  return (
    <Flex
      component="form"
      direction="column"
      onSubmit={handleSubmit(({ email }) => send(email))}
      noValidate
      gap={18}
    >
      <TextInput
        {...register("email")}
        type="email"
        autoComplete="email"
        label="Email"
        placeholder="example@example.com"
        error={errors.email?.message}
      />

      {sendError && (
        <Text fz={13} c="warn.7" role="alert">
          {sendError}
        </Text>
      )}

      <Button
        type="submit"
        loading={isSubmitting}
        color="orange.5"
        radius={12}
        h={48}
        fz={16}
        fw={700}
      >
        Gửi link đặt lại mật khẩu
      </Button>
    </Flex>
  );
}
