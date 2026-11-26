import { useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { authEmail } from "@/features/auth/validation";
import {
  AppText,
  Button,
  Notice,
  Screen,
  Spacer,
  TextField,
} from "@/ui/components";

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    tone: "danger" | "success";
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    const parsed = authEmail.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email không hợp lệ.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const { error: failure } = await sendPasswordReset(parsed.data);
      // Same answer whether or not the address has an account, as on the web.
      setMessage(
        failure && failure.code?.startsWith("over_")
          ? { text: authErrorMessage(failure), tone: "danger" }
          : {
              text: "Nếu email này có tài khoản, Englow3 đã gửi link đặt lại mật khẩu. Mở link trên điện thoại này.",
              tone: "success",
            },
      );
    } catch {
      setMessage({ text: authErrorMessage(null), tone: "danger" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <AppText tone="muted">
        Nhập email bạn dùng để đăng ký. Chúng tôi sẽ gửi link để bạn đặt mật
        khẩu mới.
      </AppText>
      <Spacer />
      <Notice message={message?.text} tone={message?.tone} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        error={error}
      />
      <Button title="Gửi link đặt lại" onPress={submit} loading={pending} />
    </Screen>
  );
}
