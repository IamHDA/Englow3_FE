import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/features/auth/AuthProvider";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { fieldErrors, registrationRequest } from "@/features/auth/validation";
import { env } from "@/lib/env";
import {
  AppText,
  Button,
  Choice,
  EmptyState,
  Notice,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

const GENDERS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
] as const;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    displayName: "",
    email: "",
    password: "",
    birthDate: "",
    gender: "" as string,
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit() {
    const parsed = registrationRequest.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setMessage(null);
    setPending(true);
    try {
      const { error, needsConfirmation } = await signUp(parsed.data);
      if (error) setMessage(authErrorMessage(error));
      else if (needsConfirmation) setSentTo(parsed.data.email);
      // Otherwise a session arrived and the root navigator moves on by itself.
    } catch {
      setMessage(authErrorMessage(null));
    } finally {
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <Screen>
        <EmptyState
          icon="mail-unread-outline"
          title="Kiểm tra hộp thư của bạn"
          message={`Englow3 đã gửi thư xác nhận tới ${sentTo}. Mở link trong thư trên điện thoại này để kích hoạt tài khoản.`}
          action={
            <Button
              title="Về đăng nhập"
              onPress={() => router.replace("/login")}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Screen edges={["bottom", "left", "right"]}>
        <Notice message={message} />
        <TextField
          label="Họ và tên"
          value={form.fullName}
          onChangeText={(v) => set("fullName", v)}
          autoComplete="name"
          error={errors.fullName}
        />
        <TextField
          label="Tên hiển thị"
          value={form.displayName}
          onChangeText={(v) => set("displayName", v)}
          autoCapitalize="none"
          hint="3-20 ký tự: chữ không dấu, số hoặc dấu gạch dưới."
          error={errors.displayName}
        />
        <TextField
          label="Email"
          value={form.email}
          onChangeText={(v) => set("email", v)}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          label="Mật khẩu"
          value={form.password}
          onChangeText={(v) => set("password", v)}
          secureTextEntry
          autoComplete="new-password"
          hint="Ít nhất 8 ký tự, có chữ hoa, chữ thường và ký tự đặc biệt."
          error={errors.password}
        />
        <TextField
          label="Ngày sinh"
          value={form.birthDate}
          onChangeText={(v) => set("birthDate", v)}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          error={errors.birthDate}
        />
        <AppText variant="label" style={{ marginBottom: spacing.xs }}>
          Giới tính
        </AppText>
        <Row gap={spacing.sm}>
          {GENDERS.map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              selected={form.gender === option.value}
              onPress={() => set("gender", option.value)}
            />
          ))}
        </Row>
        {errors.gender ? (
          <AppText variant="caption" tone="danger">
            {errors.gender}
          </AppText>
        ) : null}

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.acceptedTerms }}
          onPress={() => set("acceptedTerms", !form.acceptedTerms)}
          style={styles.terms}
        >
          <Ionicons
            name={form.acceptedTerms ? "checkbox" : "square-outline"}
            size={22}
            color={form.acceptedTerms ? colors.primary : colors.textMuted}
          />
          <AppText style={styles.flex}>
            Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của Englow3.
          </AppText>
        </Pressable>
        <Row gap={spacing.lg} style={{ marginBottom: spacing.md }}>
          <Button
            title="Xem điều khoản"
            variant="ghost"
            size="sm"
            onPress={() =>
              void WebBrowser.openBrowserAsync(`${env.webUrl}/terms`)
            }
          />
          <Button
            title="Xem chính sách"
            variant="ghost"
            size="sm"
            onPress={() =>
              void WebBrowser.openBrowserAsync(`${env.webUrl}/privacy`)
            }
          />
        </Row>
        {errors.acceptedTerms ? (
          <AppText
            variant="caption"
            tone="danger"
            style={{ marginBottom: spacing.md }}
          >
            {errors.acceptedTerms}
          </AppText>
        ) : null}

        <Button title="Tạo tài khoản" onPress={submit} loading={pending} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  terms: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
});
