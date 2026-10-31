"use client";

import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CONTACT_EMAIL } from "@/features/legal";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import type { Plan } from "../types";
import classes from "./PricingView.module.css";

type Period = "monthly" | "yearly";

const copy = {
  vi: {
    title: "Bảng giá",
    subtitle:
      "Mọi bài thi thử, thẻ ghi nhớ, chép chính tả và luyện phát âm đều có ở cả hai gói. Gói Pro nâng số lượt AI mỗi ngày cho Writing, Speaking và gia sư.",
    monthly: "Theo tháng",
    yearly: "Theo năm",
    free: "Miễn phí",
    pro: "Pro",
    perMonth: "/tháng",
    perYear: "/năm",
    zero: "0đ",
    aiPerDay: (n: number) => `${n} lượt AI mỗi ngày`,
    aiUse: "Dùng cho chấm Writing, Speaking, phát âm và gia sư AI",
    everything: "Toàn bộ bài thi thử, flashcard, chép chính tả, luyện phát âm",
    resets: "Hạn mức làm mới mỗi ngày",
    keepData: "Hết hạn Pro, dữ liệu học tập của bạn vẫn được giữ",
    startFree: "Bắt đầu miễn phí",
    upgrade: "Liên hệ nâng cấp",
    soon: "Thanh toán sắp mở",
    paymentNote:
      "Thanh toán trực tuyến chưa mở. Hiện gói Pro được kích hoạt thủ công sau khi liên hệ.",
    referencePrices: "Giá tham khảo, có thể thay đổi trước khi mở thanh toán.",
    offline: "Không tải được bảng giá mới nhất, đang hiển thị giá tham khảo.",
    terms: "Điều khoản sử dụng",
    privacy: "Chính sách bảo mật",
    save: (percent: number) => `Tiết kiệm ${percent}%`,
  },
  en: {
    title: "Pricing",
    subtitle:
      "Every mock test, flashcard, dictation and pronunciation drill is in both plans. Pro raises the daily AI requests for Writing, Speaking and the tutor.",
    monthly: "Monthly",
    yearly: "Yearly",
    free: "Free",
    pro: "Pro",
    perMonth: "/month",
    perYear: "/year",
    zero: "0 VND",
    aiPerDay: (n: number) => `${n} AI requests per day`,
    aiUse:
      "Used for Writing and Speaking marking, pronunciation and the AI tutor",
    everything: "All mock tests, flashcards, dictation and pronunciation",
    resets: "Allowance resets every day",
    keepData: "Your learning data is kept when Pro ends",
    startFree: "Start free",
    upgrade: "Contact us to upgrade",
    soon: "Payments coming soon",
    paymentNote:
      "Online payment is not open yet. For now Pro is switched on by hand after you contact us.",
    referencePrices: "Reference prices, which may change before payments open.",
    offline:
      "The latest prices could not be loaded; reference prices are shown.",
    terms: "Terms of service",
    privacy: "Privacy policy",
    save: (percent: number) => `Save ${percent}%`,
  },
} as const;

function vnd(amount: number, language: "vi" | "en") {
  const digits = amount.toLocaleString(language === "vi" ? "vi-VN" : "en-US");
  return language === "vi" ? `${digits}đ` : `${digits} VND`;
}

export function PricingView({ plans, live }: { plans: Plan[]; live: boolean }) {
  const { language } = useLanguage();
  const c = copy[language];
  const [period, setPeriod] = useState<Period>("monthly");
  const free = plans.find((plan) => plan.code === "FREE");
  const pro = plans.find((plan) => plan.code === "PRO");
  const saving =
    pro && pro.priceVndMonthly > 0
      ? Math.round((1 - pro.priceVndYearly / (pro.priceVndMonthly * 12)) * 100)
      : 0;

  return (
    <Page>
      <PageHeader title={c.title} />
      <Text c="ink.7" maw={720}>
        {c.subtitle}
      </Text>

      {!live && (
        <Alert color="orange" radius="md" variant="light">
          {c.offline}
        </Alert>
      )}

      <Group gap="xs" role="group" aria-label={c.title}>
        {(["monthly", "yearly"] as const).map((value) => (
          <Button
            key={value}
            variant={period === value ? "filled" : "default"}
            color="navy.9"
            radius="xl"
            size="sm"
            aria-pressed={period === value}
            onClick={() => setPeriod(value)}
          >
            {value === "monthly" ? c.monthly : c.yearly}
          </Button>
        ))}
        {period === "monthly" && saving > 0 && (
          <Badge color="teal" variant="light">
            {c.yearly}: {c.save(saving)}
          </Badge>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {free && (
          <Paper withBorder radius="lg" p="xl" className={classes.card}>
            <Stack gap="md">
              <Title order={2} fz={22}>
                {c.free}
              </Title>
              <Text className={classes.price}>{c.zero}</Text>
              <Features
                items={[
                  c.everything,
                  c.aiPerDay(free.aiDailyRequestLimit),
                  c.aiUse,
                  c.resets,
                ]}
              />
              <Button
                component={Link}
                href="/welcome"
                variant="default"
                radius="md"
              >
                {c.startFree}
              </Button>
            </Stack>
          </Paper>
        )}
        {pro && (
          <Paper
            withBorder
            radius="lg"
            p="xl"
            className={`${classes.card} ${classes.featured}`}
          >
            <Stack gap="md">
              <Title order={2} fz={22}>
                {c.pro}
              </Title>
              <Text className={classes.price}>
                {vnd(
                  period === "monthly"
                    ? pro.priceVndMonthly
                    : pro.priceVndYearly,
                  language,
                )}
                <span className={classes.unit}>
                  {period === "monthly" ? c.perMonth : c.perYear}
                </span>
              </Text>
              <Features
                items={[
                  c.everything,
                  c.aiPerDay(pro.aiDailyRequestLimit),
                  c.aiUse,
                  c.keepData,
                ]}
              />
              {CONTACT_EMAIL ? (
                <Button
                  component="a"
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Englow3 Pro")}`}
                  color="orange.5"
                  radius="md"
                >
                  {c.upgrade}
                </Button>
              ) : (
                <Button color="orange.5" radius="md" disabled>
                  {c.soon}
                </Button>
              )}
              <Text size="xs" c="ink.6">
                {c.paymentNote} {c.referencePrices}
              </Text>
            </Stack>
          </Paper>
        )}
      </SimpleGrid>

      <Text size="sm">
        <Link href="/terms" className={classes.link}>
          {c.terms}
        </Link>
        {" · "}
        <Link href="/privacy" className={classes.link}>
          {c.privacy}
        </Link>
      </Text>
    </Page>
  );
}

function Features({ items }: { items: string[] }) {
  return (
    <Stack gap={8} component="ul" className={classes.features}>
      {items.map((item) => (
        <Group
          key={item}
          gap={8}
          wrap="nowrap"
          align="flex-start"
          component="li"
        >
          <Check size={16} aria-hidden="true" className={classes.check} />
          <Text size="sm" c="ink.8">
            {item}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}
