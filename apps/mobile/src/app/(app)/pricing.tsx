import { Stack } from "expo-router";
import { useEffect, useState } from "react";

import {
  fetchPlans,
  fetchSubscription,
  type Plan,
  type Subscription,
} from "@/features/account/accountApi";
import { formatDate } from "@/features/shared/labels";
import {
  AppText,
  Badge,
  Card,
  ErrorState,
  LoadingState,
  Notice,
  Row,
  Screen,
} from "@/ui/components";
import { spacing } from "@/ui/theme";

const vnd = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

/**
 * Plans and the learner's own. Paying in the app is not available yet - Pro is
 * granted by the team for now - so this screen informs rather than sells.
 */
export default function PricingScreen() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [failed, setFailed] = useState(false);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([fetchPlans(), fetchSubscription().catch(() => null)])
      .then(([loadedPlans, loadedSubscription]) => {
        if (!active) return;
        setPlans(loadedPlans);
        setSubscription(loadedSubscription);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const load = () => {
    setFailed(false);
    setAttempt((value) => value + 1);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Gói dịch vụ" }} />
      {failed ? (
        <ErrorState message="Chưa tải được bảng giá." onRetry={load} />
      ) : !plans ? (
        <LoadingState />
      ) : (
        <>
          {subscription ? (
            <Card style={{ marginBottom: spacing.lg }}>
              <AppText variant="label">
                Gói của bạn: {subscription.plan === "PRO" ? "Pro" : "Miễn phí"}
              </AppText>
              {subscription.currentPeriodEnd ? (
                <AppText tone="muted">
                  Hiệu lực đến {formatDate(subscription.currentPeriodEnd)}
                </AppText>
              ) : null}
              <AppText tone="muted">
                Đã dùng {subscription.aiRequestsToday}/
                {subscription.aiDailyRequestLimit} lượt AI hôm nay
              </AppText>
            </Card>
          ) : null}
          {plans.map((plan) => (
            <Card key={plan.code} style={{ marginBottom: spacing.md }}>
              <Row style={{ justifyContent: "space-between" }}>
                <AppText variant="heading">
                  {plan.code === "PRO" ? "Pro" : "Miễn phí"}
                </AppText>
                {subscription?.plan === plan.code ? (
                  <Badge label="Đang dùng" tone="success" />
                ) : null}
              </Row>
              <AppText>
                {plan.priceVndMonthly === 0
                  ? "0đ"
                  : `${vnd(plan.priceVndMonthly)}/tháng · ${vnd(plan.priceVndYearly)}/năm`}
              </AppText>
              <AppText tone="muted">
                {plan.aiDailyRequestLimit} lượt gia sư và chấm bài AI mỗi ngày
              </AppText>
            </Card>
          ))}
          <Notice
            tone="info"
            message="Thanh toán trong ứng dụng sắp ra mắt. Liên hệ đội ngũ Englow3 nếu bạn muốn dùng gói Pro."
          />
        </>
      )}
    </Screen>
  );
}
