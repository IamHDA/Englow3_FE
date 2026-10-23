"use client";

import {
  Badge,
  Button,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { fetchSubscription, type Subscription } from "../../../api/accountApi";

import classes from "./ProfilePlanCard.module.css";

const copy = {
  vi: {
    title: "Gói dịch vụ",
    free: "Miễn phí",
    pro: "Pro",
    until: (date: string) => `Đến ${date}`,
    today: "Lượt AI hôm nay",
    pricing: "Xem bảng giá",
    resets: "Làm mới mỗi ngày",
  },
  en: {
    title: "Your plan",
    free: "Free",
    pro: "Pro",
    until: (date: string) => `Until ${date}`,
    today: "AI requests today",
    pricing: "See pricing",
    resets: "Resets every day",
  },
} as const;

/**
 * The plan and today's AI allowance. Not essential, so a failed load leaves
 * nothing on screen rather than an error in the middle of the profile.
 */
export function ProfilePlanCard() {
  const { language } = useLanguage();
  const c = copy[language];
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchSubscription(controller.signal)
      .then(setSubscription)
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  if (!subscription) return null;

  const used = Math.min(
    subscription.aiRequestsToday,
    subscription.aiDailyRequestLimit,
  );
  const percent =
    subscription.aiDailyRequestLimit > 0
      ? Math.round((used / subscription.aiDailyRequestLimit) * 100)
      : 0;
  const paid = subscription.plan === "PRO";

  return (
    <Paper radius="lg" withBorder p="lg" className={classes.paper}>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Title order={3} fz={16} fw={700} c="ink.9">
            {c.title}
          </Title>
          <Badge color={paid ? "orange" : "gray"} variant="light">
            {paid ? c.pro : c.free}
          </Badge>
        </Group>
        {paid && subscription.currentPeriodEnd && (
          <Text size="sm" c="ink.7">
            {c.until(
              new Date(subscription.currentPeriodEnd).toLocaleDateString(
                language === "vi" ? "vi-VN" : "en-US",
              ),
            )}
          </Text>
        )}
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="sm" c="ink.7">
              {c.today}
            </Text>
            <Text size="sm" fw={600}>
              {used} / {subscription.aiDailyRequestLimit}
            </Text>
          </Group>
          <Progress
            value={percent}
            color={percent >= 90 ? "red" : "navy.9"}
            size="sm"
            radius="xl"
            aria-label={c.today}
          />
          <Text size="xs" c="ink.6">
            {c.resets}
          </Text>
        </Stack>
        <Button
          component={Link}
          href="/pricing"
          variant="light"
          color="navy"
          radius="md"
          size="xs"
        >
          {c.pricing}
        </Button>
      </Stack>
    </Paper>
  );
}
