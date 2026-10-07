"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Flex, Stack, Text, TextInput } from "@mantine/core";
import { MailCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useLanguage } from "@/shared/hooks/useLanguage";

function forgotPasswordSchema(isVi: boolean) {
  return z.object({
    email: z
      .string()
      .min(1, isVi ? "Vui lòng nhập email" : "Enter your email")
      .email(isVi ? "Email không hợp lệ" : "That email is not valid"),
  });
}

type ForgotPasswordValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;

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
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const schema = useMemo(() => forgotPasswordSchema(isVi), [isVi]);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function send(email: string) {
    setSendError(null);
    try {
      const error = await onSend(email);
      if (error) {
        setSendError(error);
        return;
      }
      setSentTo(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setSendError(
        tr(
          "Không gửi được email. Kiểm tra kết nối rồi thử lại.",
          "Could not send the email. Check the connection and try again.",
        ),
      );
    }
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
          title={tr("Đã gửi link đặt lại mật khẩu", "Reset link sent")}
        >
          {/* Supabase answers the same whether or not the address has an
              account, so this does not claim that it does. */}
          {isVi ? (
            <>
              Nếu <b>{sentTo}</b> đã đăng ký Englow3, thư sẽ tới trong vài phút.
              Link có hiệu lực trong 1 giờ và chỉ dùng được một lần.
            </>
          ) : (
            <>
              If <b>{sentTo}</b> has an Englow3 account, the email will arrive
              within a few minutes. The link works for 1 hour, and only once.
            </>
          )}
        </Alert>
        <Text fz={13} c="ink.6">
          {tr(
            "Không thấy thư? Kiểm tra thư mục Spam hoặc Quảng cáo, hoặc gửi lại.",
            "No email? Check the Spam or Promotions folder, or send it again.",
          )}
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
          {cooldown > 0
            ? tr(`Gửi lại sau ${cooldown} giây`, `Resend in ${cooldown}s`)
            : tr("Gửi lại link", "Resend link")}
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
        {tr("Gửi link đặt lại mật khẩu", "Send reset link")}
      </Button>
    </Flex>
  );
}
