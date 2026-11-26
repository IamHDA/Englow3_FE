import { Stack, router } from "expo-router";
import { useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { newAuthPassword } from "@/features/auth/validation";
import { Button, Notice, Screen, TextField } from "@/ui/components";

export default function ChangePasswordScreen() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    const parsed = newAuthPassword.safeParse(password);
    const next: typeof errors = {};
    if (!parsed.success) next.password = parsed.error.issues[0]?.message;
    if (password !== confirm) next.confirm = "Hai mật khẩu chưa khớp.";
    setErrors(next);
    if (next.password || next.confirm) return;
    setPending(true);
    setMessage(null);
    try {
      const { error } = await updatePassword(password);
      if (error) setMessage(authErrorMessage(error));
      else router.back();
    } catch {
      setMessage(authErrorMessage(null));
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Đổi mật khẩu" }} />
      <Notice message={message} />
      <TextField
        label="Mật khẩu mới"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        hint="Ít nhất 8 ký tự, có chữ hoa, chữ thường và ký tự đặc biệt."
        error={errors.password}
      />
      <TextField
        label="Nhập lại mật khẩu"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
        error={errors.confirm}
      />
      <Button
        title="Lưu mật khẩu"
        loading={pending}
        onPress={() => void submit()}
      />
    </Screen>
  );
}
