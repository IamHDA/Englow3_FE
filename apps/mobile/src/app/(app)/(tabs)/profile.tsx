import { router, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";

import {
  fetchSubscription,
  type Subscription,
} from "@/features/account/accountApi";
import { useTour } from "@/features/tour/TourProvider";
import { isBackOfficeRole, useAuth } from "@/features/auth/AuthProvider";
import { Avatar } from "@/features/shared/Avatar";
import {
  CEFR_LABELS,
  SKILL_LABELS,
  formatDate,
} from "@/features/shared/labels";
import { env } from "@/lib/env";
import { OnboardingStep } from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  ListItem,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

export default function ProfileScreen() {
  const { me, signOut, refetchMe } = useAuth();
  const tour = useTour();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refetchMe();
      fetchSubscription()
        .then(setSubscription)
        .catch(() => setSubscription(null));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  if (!me) return null;
  const goals = me.onboardingState;

  return (
    <Screen onRefresh={() => void refetchMe()} refreshing={false}>
      <Card style={{ marginBottom: spacing.lg }}>
        <Row>
          <Avatar url={me.avatarUrl} name={me.displayName} size={64} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading">{me.fullName}</AppText>
            <AppText tone="muted">@{me.displayName}</AppText>
            <AppText variant="caption" tone="muted">
              {me.email}
            </AppText>
          </View>
        </Row>
        <Row gap={spacing.sm} style={{ marginTop: spacing.md }}>
          {subscription ? (
            <Badge
              label={subscription.plan === "PRO" ? "Pro" : "Miễn phí"}
              tone={subscription.plan === "PRO" ? "accent" : "neutral"}
            />
          ) : null}
          {isBackOfficeRole(me.role) ? (
            <Badge
              label={me.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
            />
          ) : null}
        </Row>
        <Button
          title="Sửa hồ sơ"
          variant="secondary"
          size="sm"
          style={{ marginTop: spacing.md }}
          onPress={() => router.push("/profile/edit")}
        />
      </Card>

      <Section
        title="Mục tiêu học"
        action={
          <Button
            title="Cập nhật"
            variant="ghost"
            size="sm"
            onPress={() => router.push("/onboarding")}
          />
        }
      >
        {me.onboardingStep !== OnboardingStep.COMPLETED ? (
          <AppText tone="muted">Bạn chưa hoàn tất thiết lập lộ trình.</AppText>
        ) : goals ? (
          <Card>
            {goals.currentLevel ? (
              <AppText>
                Trình độ hiện tại: {CEFR_LABELS[goals.currentLevel].label}
              </AppText>
            ) : null}
            {goals.targetCertificateType ? (
              <AppText>
                Mục tiêu: {goals.targetCertificateType}{" "}
                {goals.targetScore ?? ""}
              </AppText>
            ) : goals.targetLevel ? (
              <AppText>
                Mục tiêu: {CEFR_LABELS[goals.targetLevel].label}
              </AppText>
            ) : null}
            {goals.targetDate ? (
              <AppText>Hạn: {formatDate(goals.targetDate)}</AppText>
            ) : null}
            {goals.dailyStudyMinutes ? (
              <AppText>{goals.dailyStudyMinutes} phút mỗi ngày</AppText>
            ) : null}
            {goals.targetSkills.length > 0 ? (
              <AppText tone="muted">
                Kỹ năng:{" "}
                {goals.targetSkills
                  .map((skill) => SKILL_LABELS[skill])
                  .join(", ")}
              </AppText>
            ) : null}
          </Card>
        ) : null}
      </Section>

      <Section title="Tài khoản">
        <ListItem
          icon="diamond-outline"
          iconColor={colors.accent}
          title="Gói dịch vụ"
          subtitle={
            subscription
              ? `${subscription.plan === "PRO" ? "Pro" : "Miễn phí"} · AI ${subscription.aiRequestsToday}/${subscription.aiDailyRequestLimit} lượt hôm nay`
              : undefined
          }
          onPress={() => router.push("/pricing")}
        />
        <ListItem
          icon="person-outline"
          title="Trang cá nhân công khai"
          onPress={() =>
            router.push({
              pathname: "/people/[userId]",
              params: { userId: me.id },
            })
          }
        />
        <ListItem
          icon="key-outline"
          title="Đổi mật khẩu"
          onPress={() => router.push("/profile/password")}
        />
        {tour.canReplay ? (
          <ListItem
            icon="help-circle-outline"
            title="Xem lại hướng dẫn"
            onPress={tour.replay}
          />
        ) : null}
        {isBackOfficeRole(me.role) ? (
          <ListItem
            icon="shield-checkmark-outline"
            title="Khu quản trị"
            onPress={() => router.push("/admin")}
          />
        ) : null}
      </Section>

      <Section title="Thông tin">
        <ListItem
          icon="document-text-outline"
          title="Điều khoản sử dụng"
          onPress={() =>
            void WebBrowser.openBrowserAsync(`${env.webUrl}/terms`)
          }
        />
        <ListItem
          icon="lock-closed-outline"
          title="Chính sách bảo mật"
          onPress={() =>
            void WebBrowser.openBrowserAsync(`${env.webUrl}/privacy`)
          }
        />
      </Section>

      <Button
        title="Đăng xuất"
        variant="secondary"
        icon="log-out-outline"
        onPress={() =>
          Alert.alert("Đăng xuất?", undefined, [
            { text: "Huỷ", style: "cancel" },
            {
              text: "Đăng xuất",
              style: "destructive",
              onPress: () => void signOut(),
            },
          ])
        }
      />
      <Button
        title="Xoá tài khoản"
        variant="ghost"
        onPress={() => router.push("/profile/delete")}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}
