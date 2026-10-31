"use client";

import {
  Alert,
  Button,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  grantPaidPlan,
  revokePaidPlan,
  SubscriptionApiError,
  type BillingPeriod,
} from "../../../api/subscriptions";

const copy = {
  vi: {
    title: "Gói dịch vụ",
    intro:
      "Cấp hoặc thu hồi gói Pro cho một học viên. Dùng cho đến khi cổng thanh toán được nối: cấp gói sau khi nhận thanh toán, hoặc để tặng thử.",
    email: "Email học viên",
    period: "Chu kỳ",
    monthly: "Theo tháng",
    yearly: "Theo năm",
    days: "Số ngày cấp thêm",
    extend: "Nếu học viên còn gói Pro, số ngày được cộng vào cuối kỳ hiện tại.",
    grant: "Cấp gói Pro",
    revoke: "Thu hồi về Free",
    granted: (email: string) => `Đã cấp gói Pro cho ${email}`,
    revoked: (email: string) => `Đã đưa ${email} về gói Miễn phí`,
    errors: {
      USER_NOT_FOUND: "Không có tài khoản nào dùng email này.",
      FORBIDDEN: "Chỉ quản trị viên mới được đổi gói dịch vụ.",
      ACCESS_DENIED: "Chỉ quản trị viên mới được đổi gói dịch vụ.",
      SUBSCRIPTION_DAYS_INVALID: "Số ngày phải từ 1 đến 3650.",
      SUBSCRIPTION_PERIOD_INVALID: "Chu kỳ không hợp lệ.",
      default: "Không thực hiện được. Thử lại sau ít phút.",
    } as Record<string, string>,
  },
  en: {
    title: "Plans",
    intro:
      "Grant or revoke the Pro plan for one learner. Used until a payment provider is connected: grant after a payment arrives, or as a trial.",
    email: "Learner email",
    period: "Period",
    monthly: "Monthly",
    yearly: "Yearly",
    days: "Days to add",
    extend:
      "If the learner already has Pro, the days are added to the end of the current period.",
    grant: "Grant Pro",
    revoke: "Revoke to Free",
    granted: (email: string) => `Pro granted to ${email}`,
    revoked: (email: string) => `${email} is back on the Free plan`,
    errors: {
      USER_NOT_FOUND: "No account uses that email.",
      FORBIDDEN: "Only administrators can change plans.",
      ACCESS_DENIED: "Only administrators can change plans.",
      SUBSCRIPTION_DAYS_INVALID: "Days must be between 1 and 3650.",
      SUBSCRIPTION_PERIOD_INVALID: "Invalid period.",
      default: "Could not do that. Try again in a few minutes.",
    } as Record<string, string>,
  },
} as const;

/** The administrator's screen for putting a learner on the paid plan by hand. */
export function AdminSubscriptionsView() {
  const { language } = useLanguage();
  const c = copy[language];
  const [email, setEmail] = useState("");
  const [period, setPeriod] = useState<BillingPeriod>("MONTHLY");
  const [days, setDays] = useState<number | string>(30);
  const [busy, setBusy] = useState<"grant" | "revoke" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmed = email.trim();
  const validDays =
    typeof days === "number" && Number.isInteger(days) && days >= 1;

  async function run(kind: "grant" | "revoke") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "grant") {
        await grantPaidPlan(trimmed, period, Number(days));
        notifications.show({ color: "teal", message: c.granted(trimmed) });
      } else {
        await revokePaidPlan(trimmed);
        notifications.show({ color: "teal", message: c.revoked(trimmed) });
      }
    } catch (failure) {
      const code =
        failure instanceof SubscriptionApiError ? failure.code : "default";
      setError(c.errors[code] ?? c.errors.default);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Page width="focus">
      <PageHeader title={c.title} />
      <Text c="ink.7">{c.intro}</Text>
      <Paper withBorder radius="lg" p="xl">
        <Stack gap="md">
          <TextInput
            label={c.email}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            autoComplete="off"
            required
          />
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              {c.period}
            </Text>
            <SegmentedControl
              value={period}
              onChange={(value) => {
                setPeriod(value as BillingPeriod);
                setDays(value === "YEARLY" ? 365 : 30);
              }}
              data={[
                { value: "MONTHLY", label: c.monthly },
                { value: "YEARLY", label: c.yearly },
              ]}
              aria-label={c.period}
            />
          </Stack>
          <NumberInput
            label={c.days}
            description={c.extend}
            value={days}
            onChange={setDays}
            min={1}
            max={3650}
            allowDecimal={false}
            clampBehavior="strict"
          />
          {error && (
            <Alert color="red" variant="light" role="alert">
              {error}
            </Alert>
          )}
          <Group>
            <Button
              color="navy.9"
              disabled={trimmed === "" || !validDays || busy === "revoke"}
              loading={busy === "grant"}
              onClick={() => void run("grant")}
            >
              {c.grant}
            </Button>
            <Button
              variant="outline"
              color="red"
              disabled={trimmed === "" || busy === "grant"}
              loading={busy === "revoke"}
              onClick={() => void run("revoke")}
            >
              {c.revoke}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Page>
  );
}
