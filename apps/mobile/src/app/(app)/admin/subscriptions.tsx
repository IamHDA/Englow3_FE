import { Redirect, Stack } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { grantPro, revokePro } from "@/features/admin/adminApi";
import { useAuth } from "@/features/auth/AuthProvider";
import { RestError } from "@/lib/rest";
import {
  AppText,
  Button,
  Card,
  Choice,
  Notice,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { spacing } from "@/ui/theme";

const SUBSCRIPTION_ERRORS: Record<string, string> = {
  USER_NOT_FOUND: "Không có tài khoản nào với email này.",
  SUBSCRIPTION_PERIOD_INVALID: "Kỳ hạn gói không hợp lệ.",
  SUBSCRIPTION_DAYS_INVALID: "Số ngày không hợp lệ.",
};

/** Pro is granted by hand while payments are deferred. Administrators only. */
export default function AdminSubscriptionsScreen() {
  const { me } = useAuth();
  const [email, setEmail] = useState("");
  const [period, setPeriod] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [days, setDays] = useState("30");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{
    text: string;
    tone: "success" | "danger";
  } | null>(null);

  if (me?.role !== "ADMIN") return <Redirect href="/admin" />;

  const fail = (failure: unknown) =>
    setNotice({
      text:
        failure instanceof RestError
          ? (SUBSCRIPTION_ERRORS[failure.code] ?? "Chưa thực hiện được.")
          : "Chưa thực hiện được.",
      tone: "danger",
    });

  async function grant() {
    const count = Number(days);
    if (
      !email.trim() ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 3650
    ) {
      setNotice({
        text: "Nhập email và số ngày từ 1 đến 3650.",
        tone: "danger",
      });
      return;
    }
    setPending(true);
    try {
      await grantPro(email.trim(), period, count);
      setNotice({
        text: `Đã cấp Pro ${count} ngày cho ${email.trim()}.`,
        tone: "success",
      });
    } catch (failure) {
      fail(failure);
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Gói Pro" }} />
      <Notice message={notice?.text} tone={notice?.tone} />
      <TextField
        label="Email học viên"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Section title="Cấp gói Pro">
        <Row gap={spacing.sm}>
          <Choice
            label="Tháng"
            selected={period === "MONTHLY"}
            onPress={() => setPeriod("MONTHLY")}
          />
          <Choice
            label="Năm"
            selected={period === "YEARLY"}
            onPress={() => setPeriod("YEARLY")}
          />
        </Row>
        <TextField
          label="Số ngày"
          value={days}
          onChangeText={setDays}
          keyboardType="number-pad"
        />
        <Button
          title="Cấp Pro"
          loading={pending}
          onPress={() => void grant()}
        />
      </Section>
      <Card>
        <AppText variant="label">Thu hồi gói Pro</AppText>
        <AppText tone="muted" style={{ marginBottom: spacing.sm }}>
          Người dùng trở về gói miễn phí ngay lập tức.
        </AppText>
        <Button
          title="Thu hồi"
          variant="danger"
          disabled={!email.trim()}
          onPress={() =>
            Alert.alert("Thu hồi Pro?", email.trim(), [
              { text: "Huỷ", style: "cancel" },
              {
                text: "Thu hồi",
                style: "destructive",
                onPress: () =>
                  void revokePro(email.trim())
                    .then(() =>
                      setNotice({
                        text: `Đã thu hồi Pro của ${email.trim()}.`,
                        tone: "success",
                      }),
                    )
                    .catch(fail),
              },
            ])
          }
        />
      </Card>
    </Screen>
  );
}
