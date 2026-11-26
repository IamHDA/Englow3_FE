import { Stack } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { AccountApiError, eraseAccount } from "@/features/account/accountApi";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  AppText,
  Button,
  Card,
  Notice,
  Screen,
  TextField,
} from "@/ui/components";
import { spacing } from "@/ui/theme";

/** Account erasure, as on the web: the learner types their e-mail to confirm. */
export default function DeleteAccountScreen() {
  const { me, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const matches =
    Boolean(me) && email.trim().toLowerCase() === me?.email.toLowerCase();

  async function erase() {
    setPending(true);
    setError(null);
    try {
      await eraseAccount(email.trim());
      await signOut();
    } catch (failure) {
      setError(
        failure instanceof AccountApiError &&
          failure.code === "ACCOUNT_CONFIRMATION_MISMATCH"
          ? "Email xác nhận không khớp."
          : "Chưa xoá được tài khoản. Hãy thử lại sau.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Xoá tài khoản" }} />
      <Card style={{ marginBottom: spacing.lg }}>
        <AppText variant="label" tone="danger">
          Thao tác này không thể hoàn tác.
        </AppText>
        <AppText style={{ marginTop: spacing.xs }}>
          Hồ sơ, tiến độ học, bài làm, bài viết và tin nhắn của bạn sẽ bị xoá
          vĩnh viễn.
        </AppText>
      </Card>
      <Notice message={error} />
      <TextField
        label={`Nhập email của bạn (${me?.email ?? ""}) để xác nhận`}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Button
        title="Xoá vĩnh viễn tài khoản"
        variant="danger"
        disabled={!matches}
        loading={pending}
        onPress={() =>
          Alert.alert(
            "Xoá tài khoản?",
            "Mọi dữ liệu của bạn sẽ mất vĩnh viễn.",
            [
              { text: "Huỷ", style: "cancel" },
              {
                text: "Xoá",
                style: "destructive",
                onPress: () => void erase(),
              },
            ],
          )
        }
      />
    </Screen>
  );
}
