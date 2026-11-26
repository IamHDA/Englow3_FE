import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { fieldErrors, loginRequest } from "@/features/auth/validation";
import {
  AppText,
  Button,
  Notice,
  Row,
  Screen,
  Spacer,
  TextField,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

export default function LoginScreen() {
  const { signIn, signInWithProvider, resendConfirmation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    text: string;
    tone: "danger" | "success";
  } | null>(null);
  const [pending, setPending] = useState<
    "password" | "google" | "facebook" | "resend" | null
  >(null);
  const [unconfirmed, setUnconfirmed] = useState(false);

  async function submit() {
    const parsed = loginRequest.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setMessage(null);
    setPending("password");
    try {
      const { error } = await signIn(parsed.data.email, parsed.data.password);
      if (error) {
        setUnconfirmed(error.code === "email_not_confirmed");
        setMessage({ text: authErrorMessage(error), tone: "danger" });
      }
    } catch {
      setMessage({ text: authErrorMessage(null), tone: "danger" });
    } finally {
      setPending(null);
    }
  }

  async function oauth(provider: "google" | "facebook") {
    setMessage(null);
    setPending(provider);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) setMessage({ text: authErrorMessage(error), tone: "danger" });
    } catch {
      setMessage({ text: authErrorMessage(null), tone: "danger" });
    } finally {
      setPending(null);
    }
  }

  async function resend() {
    setPending("resend");
    const { error } = await resendConfirmation(email);
    setPending(null);
    setMessage(
      error
        ? { text: authErrorMessage(error), tone: "danger" }
        : {
            text: "Đã gửi lại thư xác nhận. Kiểm tra hộp thư của bạn.",
            tone: "success",
          },
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Screen
        edges={["top", "bottom", "left", "right"]}
        contentStyle={styles.content}
      >
        <View style={styles.brand}>
          <AppText variant="title" tone="primary">
            Englow3
          </AppText>
          <AppText tone="muted">
            Học tiếng Anh mỗi ngày, theo lộ trình của riêng bạn.
          </AppText>
        </View>

        <Notice message={message?.text} tone={message?.tone} />
        {unconfirmed ? (
          <Button
            title="Gửi lại thư xác nhận"
            variant="ghost"
            size="sm"
            loading={pending === "resend"}
            onPress={resend}
          />
        ) : null}

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          error={errors.email}
          testID="login-email"
        />
        <TextField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          error={errors.password}
          onSubmitEditing={submit}
          testID="login-password"
        />
        <Link href="/forgot" style={styles.forgot}>
          <AppText tone="primary" variant="caption">
            Quên mật khẩu?
          </AppText>
        </Link>

        <Button
          title="Đăng nhập"
          onPress={submit}
          loading={pending === "password"}
          disabled={pending !== null && pending !== "password"}
          testID="login-submit"
        />

        <Row style={styles.divider}>
          <View style={styles.line} />
          <AppText variant="caption" tone="muted">
            hoặc
          </AppText>
          <View style={styles.line} />
        </Row>

        <Button
          title="Tiếp tục với Google"
          variant="secondary"
          icon="logo-google"
          loading={pending === "google"}
          disabled={pending !== null && pending !== "google"}
          onPress={() => oauth("google")}
        />
        <Spacer size={spacing.sm} />
        <Button
          title="Tiếp tục với Facebook"
          variant="secondary"
          icon="logo-facebook"
          loading={pending === "facebook"}
          disabled={pending !== null && pending !== "facebook"}
          onPress={() => oauth("facebook")}
        />

        <Row style={styles.footer} gap={spacing.xs}>
          <AppText tone="muted">Chưa có tài khoản?</AppText>
          <Link href="/register">
            <AppText tone="primary" variant="label">
              Đăng ký
            </AppText>
          </Link>
        </Row>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { justifyContent: "center" },
  brand: { marginBottom: spacing.xl, gap: spacing.xs },
  forgot: { alignSelf: "flex-end", marginBottom: spacing.lg },
  divider: { marginVertical: spacing.lg, gap: spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  footer: { justifyContent: "center", marginTop: spacing.xl },
});
