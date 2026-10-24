"use client";

import { Alert, Button, Stack } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { resendConfirmation } from "@/features/auth/api/authClient";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function ResendConfirmation({ email }: { email: string }) {
  const { isVi } = useLanguage();
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const busy = useRef(false);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function send() {
    if (busy.current || cooldown) return;
    busy.current = true;
    setSending(true);
    try {
      const response = await resendConfirmation(email);
      setResult(
        response.error
          ? authErrorMessage(response.error, isVi)
          : isVi
            ? "Nếu tài khoản cần xác nhận, thư sẽ được gửi tới email này. Hãy kiểm tra cả thư mục Spam."
            : "If this account needs confirmation, an email will be sent. Check your Spam folder too.",
      );
      if (!response.error || response.error.status === 429) setCooldown(60);
    } catch {
      setResult(authErrorMessage(null, isVi));
    } finally {
      busy.current = false;
      setSending(false);
    }
  }
  return (
    <Stack gap="xs">
      <Alert color="orange" role="status">
        {result ??
          (isVi
            ? "Email chưa được xác nhận. Bạn có thể yêu cầu gửi lại thư xác nhận."
            : "Your email is not confirmed. You can request another confirmation email.")}
      </Alert>
      <Button
        type="button"
        variant="light"
        loading={sending}
        disabled={cooldown > 0}
        onClick={() => void send()}
      >
        {cooldown
          ? isVi
            ? `Gửi lại sau ${cooldown} giây`
            : `Resend in ${cooldown}s`
          : isVi
            ? "Gửi lại email xác nhận"
            : "Resend confirmation email"}
      </Button>
    </Stack>
  );
}
